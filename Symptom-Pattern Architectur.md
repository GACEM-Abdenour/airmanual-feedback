# R44 Symptom-Pattern Architecture for AeroMind  
*(Provisional – non‑approved maintenance scaffold for engineer review)*  

> This document is **provisional**, is **not approved maintenance guidance**, and must be reviewed and red‑lined by appropriately licensed/qualified aircraft engineers before any implementation or operational use.  
> AeroMind must **not** invent maintenance facts, must remain **source‑bound** to approved documentation, and must **withhold technical maintenance guidance** when no usable source is retrieved.

***

## 1. Executive Summary  


AeroMind’s current RAG‑style behavior risks collapsing complex maintenance problems into a trivial mapping:  

> reported symptom → first matching manual chunk → one step  

This is structurally unsafe for aircraft maintenance support, because most R44 defects require **multi‑step diagnostic workflows** based on the Maintenance Manual (MM), Pilot’s Operating Handbook (POH), service documents, and ADs, not a single action in isolation. [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)

AeroMind needs a **symptom‑pattern architecture** that behaves more like:  

> reported symptom → symptom family → safety gate → missing context → authoritative source family → probable cause map → inspection workflow → corrective action branches → verification → follow‑up handling  

Official R44 documentation already embodies this workflow mindset:  

- The R44 Maintenance Manual organizes inspections and troubleshooting by system (airframe, drive system, fuel, powerplant, hydraulics, etc.) and embeds multi‑step checks rather than single actions. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
- The POH provides phase‑of‑flight dependent limitations, warning/caution light behavior, and **emergency/abnormal procedures** that must precede detailed maintenance steps when an in‑flight safety issue is implied. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
- Service Bulletins (SBs), Safety Notices, and ADs often refine or override earlier practices (e.g., drive belt stretching guidance, fuel tank system upgrades, exhaust/CO risks), so maintenance logic must be anchored to the **current** state of these documents. [atsb.gov](https://www.atsb.gov.au/news/2023/changes-robinson-drive-belt-stretching-guidance)

However, manuals and regulatory documents **by themselves** are not sufficient unless they are:  

- **Classified** by symptom family (vibration, fuel leak, clutch light, chip light, etc.).  
- **Linked** to a safety‑first gating logic (e.g., in‑flight vibration with chip light vs. minor ground vibration at idle).  
- **Organized** into probable cause maps and inspection sequences rather than flat troubleshooting tables.  
- **Contextualized** by model/variant (Raven I vs Raven II), configuration (fuel bladders vs aluminum tanks), and recent maintenance history. [en.wikipedia](https://en.wikipedia.org/wiki/Robinson_R44)

This architecture document defines a **reusable, R44‑specific symptom‑pattern framework** that:  

- Separates **conversation intent** from **engineering task type**, so the same phrase (e.g. “rotor vibration”) can route to explanation, parts identification, or fault diagnosis depending on context.  
- Defines **answer modes** such as `complete_inspection_sequence`, `guided_diagnostic_continuation`, `clarification_required`, and `no_source_guard` to ensure AeroMind either provides a **complete, source‑backed investigation pattern** or explicitly stops short when sources are insufficient.  
- Introduces a **Symptom Pattern Schema** that engineers can populate for each R44 symptom family (vibration, fuel smell, clutch light, tail rotor, etc.), mapping user language to safety gates, source families, retrieval strategy, and workflow templates.  

Throughout this document, every rule is **provisional** and **must be vetted by appropriately licensed aircraft engineers** before use. AeroMind must not position these patterns as officially approved guidance, and **must not generate procedural, limit, or torque values unless retrieved from an authoritative source.**

***

## 2. Architectural Problem  

### 2.1 Current Failure Mode  

The naive RAG pipeline can be summarized as:  

> reported symptom → semantic search → top chunk from mixed corpus → single answer  

This fails for R44 maintenance because:  

- A single symptom (e.g., “vibration,” “fuel smell,” “clutch light”) usually maps to **multiple potential causes** spanning several systems and components (rotor, engine, fuel, drive, electrical). [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
- R44 troubleshooting content is typically embedded in **tables or multi‑step sections**, not self‑contained in one paragraph; the first retrieved chunk will rarely contain the **full inspection path**. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
- Many symptoms require an **initial safety decision** (e.g., in‑flight vs. ground, presence of warning lights, control authority) before any detailed mechanical inspection is appropriate; POH emergency procedures often precede MM troubleshooting. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
- Mechanics typically expect an **inspection / corrective‑action sequence**:  
  - classify the symptom (when it occurs, how it feels/sounds/smells)  
  - check obvious safety hazards  
  - inspect a series of likely components  
  - perform corrective actions based on findings  
  - verify and document results  

Not a single isolated suggestion such as “balance the rotor” or “check the gascolator.” [scribd](https://www.scribd.com/document/983511624/vp100-12mois)

### 2.2 Continuity and Source-Family Issues  

- Short follow‑up messages (“still persists,” “I checked that,” “chip light on too”) require **continuity of symptom family and probable cause map**, not a fresh retrieval session that forgets previous steps.  
- Source families differ by **task type**:  
  - POH for operational limits, warning light meanings, and emergency/abnormal in‑flight procedures. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
  - Maintenance Manual for inspections, troubleshooting sequences, tolerances, and ground run requirements. [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)
  - Illustrated Parts Catalog (IPC) for part numbers and assemblies (rotor blades, clutch actuator components, belts, etc.).  
  - Service Bulletins/Letters/Notices and ADs for **updated procedures or mandatory changes** (drive belt practices, fuel tank configurations, exhaust/CO mitigation). [australianflying.com](https://www.australianflying.com.au/news/casa-warns-about-r44-exhaust-systems)

A generic semantic search across all documents risks mixing:  

- POH emergency procedures into maintenance sequences without phase‑of‑flight context.  
- Outdated SB/AD logic with current guidance.  
- IPC part‑number details into fault diagnosis where they are irrelevant.  

Therefore, AeroMind must move from a **chunk‑first** architecture to a **symptom‑pattern‑first** architecture that:  

1. Classifies the **symptom family** and **engineering task type**.  
2. Applies a **safety gate** (flight vs. ground, loss of control, warning lights, smoke/fumes, etc.).  
3. Selects **preferred source families** and query expansions based on that pattern.  
4. Assembles multiple relevant chunks into a **probable cause map and multi‑step workflow**.  

All of this remains **provisional** until formally reviewed and approved by qualified engineers.

***

## 3. Core Concept: Symptom Pattern  

A **symptom pattern** is a structured diagnostic object that maps messy user symptom language into a safe, source‑bound maintenance investigation flow for the Robinson R44. It is **not** a single answer; it is a **configuration** describing how AeroMind should reason, retrieve, and respond.  

Each symptom pattern explicitly defines:  

1. **Symptom family**  
   - High‑level grouping such as “vibration / shaking,” “fuel smell / fuel leak,” “clutch / drive system,” “warning lights,” “engine roughness,” etc.  
2. **Safety gate**  
   - Rules to determine if immediate POH emergency/abnormal procedures or “do not fly” messages must take precedence over further maintenance troubleshooting (e.g., smoke in cabin, loss of tail rotor authority, low oil pressure in flight). [australianflying.com](https://www.australianflying.com.au/news/casa-warns-about-r44-exhaust-systems)
3. **Required context**  
   - Targeted questions to collect critical context: phase of operation, instruments/warning lights, configuration, recent maintenance, environmental conditions, etc. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
4. **Likely causes / probable cause map (provisional)**  
   - A structured enumeration of potential causes based on manual troubleshooting, common field experience, and accident/safety data, each tagged ENGINEER_REVIEW_REQUIRED unless directly traceable to specific manual or AD tables. [atsb.gov](https://www.atsb.gov.au/sites/default/files/documents/2026-05/AO-2026-009%20Final.pdf)
5. **Preferred source families**  
   - Prioritized list of document types and sections (e.g., “MM Section X – Vibration Troubleshooting,” “POH Section – Warning Lights,” “IPC – V‑belt drive system exploded view”). [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
6. **Retrieval query strategy**  
   - How to expand the user’s phrase into **multiple related search terms** (e.g., for “shaking,” also query “vibration,” “rotor track,” “rotor balance,” “ground resonance,” etc.) and how to filter by source family.  
7. **Answer mode**  
   - Default mode for an initial defect (usually `complete_inspection_sequence`) and transitions to `guided_diagnostic_continuation`, `clarification_required`, or `no_source_guard` depending on state and retrieval results.  
8. **Inspection sequence template**  
   - A parameterized structure for building a stepwise inspection flow from the retrieved sources (e.g., “From manual section X: step 1… step 2…”). [scribd](https://www.scribd.com/document/258259825/r44-Mm-Powerplant)
9. **Corrective action branches**  
   - Conditional logic: “If finding A → corrective path A; if finding B → path B,” always citing written sources where specific actions or limits are mentioned, and tagging any inferred branch as ENGINEER_REVIEW_REQUIRED.  
10. **Verification steps**  
    - Guidance for ground run, functional checks, and follow‑up inspections after corrective action, based on MM run‑up and post‑maintenance test procedures. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_mm_checks_3f58117e9e.pdf)
11. **Feedback handling rules**  
    - How state is updated when the user says “I did X and it passed/failed,” and how to advance to the next diagnostic branch without restarting.  
12. **Escalation triggers**  
    - Conditions that should terminate routine troubleshooting and instead advise: do not fly, contact licensed maintenance, review relevant POH emergency procedures, or check applicable AD/SB. [aviation.govt](https://www.aviation.govt.nz/assets/aircraft/airworthiness-directives/helicopters/R44.pdf)
13. **Prohibited behavior**  
    - Hard constraints: e.g., “Do not approve continued flight after suspected structural blade damage,” “Do not give torque values unless directly cited,” “Do not override AD compliance statements.”  

Symptom patterns are **configuration artifacts** to be consumed later by router logic, retrieval strategy, prompt composition, and diagnostic state tracking. They do **not** themselves encode executable behavior, and everything in them remains **provisional** pending aircraft engineer approval.

***

## 4. Intent vs Engineering Task Type  

AeroMind must separate what the **user wants conversationally** (intent) from the **engineering task type** required to answer safely and correctly. A single symptom phrase can imply different engineering tasks depending on wording and context.  

### 4.1 Conversation Intent (examples)  

- `small_talk` – Non‑technical social messages.  
- `acknowledgement` – “Thanks,” “Got it,” etc.  
- `memory_recall` – “Remind me what we did last time.”  
- `context_followup` – “Still same issue,” “No, this is on the ground,” etc.  
- `technical_query` – “What does the clutch light mean?”  
- `diagnostic` – “Rotor shaking in hover, what should I inspect?”  
- `clarify` – “What do you mean by phase of flight?”  

Intent primarily influences how **direct** and **procedural** the answer should be, but not which sources are authoritative.  

### 4.2 Engineering Task Type (examples)  

- `fault_diagnosis` – Identify probable causes of a symptom and propose an inspection/verification workflow.  
- `parts_identification` – Identify part numbers or assemblies (e.g., rotor blades, belts, pulleys) from the IPC.  
- `maintenance_procedure` – Describe an inspection, removal/installation, adjustment, or service procedure from the MM. [scribd](https://www.scribd.com/document/258259825/r44-Mm-Powerplant)
- `electrical_troubleshooting` – Focused diagnosis of electrical faults (alternator, battery, breakers, wiring) using wiring diagrams and electrical sections. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
- `limits_and_specifications` – Provide operational or maintenance limits (RPM, pressures, temperatures, allowable damage, intervals) from POH or MM. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
- `airworthiness_and_compliance` – Answer whether a configuration or defect impinges on regulatory compliance or AD/SB requirements; must be conservative and source‑bound (ADs, SBs, regulatory circulars). [verticalmag](https://verticalmag.com/press-releases/fatal-accidents-prompt-new-zealand-ad-on-r44-fuel-tanks/)
- `system_explanation` – Describe how a system or component works (e.g., rotor governor, clutch actuator, hydraulic servos). [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)

### 4.3 Same Symptom, Different Task Types  

Example mappings (non‑exhaustive, provisional):  

- “What is a rotor blade?” → `system_explanation`  
- “What is the rotor blade P/N for my R44 Raven II?” → `parts_identification` (use IPC)  
- “Rotor blade is vibrating” → `fault_diagnosis` for `vibration / shaking` symptom family  
- “How do I replace the rotor blade?” → `maintenance_procedure` with MM removal/installation references  
- “What is the blade damage limit?” → `limits_and_specifications` (visual inspection and allowable damage criteria from MM)  

The **symptom pattern** for “vibration / shaking” must **not hard‑wire** one task type; instead, routing logic uses both user wording and conversation history to decide whether to surface explanation, diagnosis, or procedure.

***

## 5. Answer Modes  

Answer modes define **how AeroMind structures its response** once the symptom pattern and engineering task type are known. These modes are architectural; future implementation must respect their shapes without adding unreviewed logic.  

Every answer mode is **provisional** and must be validated by engineers.

### 5.1 `complete_inspection_sequence`  

**When to use**  

- User reports an initial defect and implicitly or explicitly asks **what to inspect** or **what to do** (e.g., “Rotor is shaking in cruise, what should I check?”).  
- User asks for “what corrective action is required,” “what inspection should be performed,” or an equivalent phrase.  
- User requests a work package, checklist, or repair plan rather than a pure explanation.  

**Expected output shape**  

- *Current Assessment:*  
  - Restate the symptom family, context known so far, and any safety concerns (e.g., “vibration in forward flight after blade maintenance, no chip lights reported”).  
- *Safety / Grounding / Setup:*  
  - Required actions from POH or MM before maintenance work (e.g., ensure aircraft is secured, master off, rotor stopped, verify no active warning lights indicating unsafe for maintenance). [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
- *Required Context or Assumptions:*  
  - Explicitly call out what is assumed or unknown (e.g., phase of flight when symptom occurs, recent maintenance, fuel quantity, hydraulic state) and request clarification as needed.  
- *Probable Cause Map:*  
  - Enumerate potential causes grouped by subsystem (e.g., main rotor track/balance, tail rotor, engine roughness, drive system), citing MM troubleshooting tables and any related safety documents; tag non‑explicit inferences as ENGINEER_REVIEW_REQUIRED. [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
- *Inspection Sequence:*  
  - Ordered steps referencing specific source sections or generic placeholders (e.g., “Inspect main rotor blades per MM Section X.X for visible damage and erosion” – ENGINEER_REVIEW_REQUIRED until engineers map exact sections). [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
- *Possible Findings:*  
  - For each step, list typical findings (e.g., “excessive belt wear,” “fuel staining at gascolator,” “oil leak at fitting”) and how they relate back to the probable cause map. [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
- *Corrective Action Branches:*  
  - For each key finding, indicate corrective paths when supported by manuals (e.g., “If leak found at fitting → follow MM fuel line replacement procedure”; specific procedure references must be tied to retrieved MM sections). [scribd](https://www.scribd.com/document/258259825/r44-Mm-Powerplant)
- *Verification / Ground Run / Functional Check:*  
  - Structured final steps (e.g., ground run at governed RPM, check for vibration/smell, verify warning lights out) using MM and POH check/run‑up procedures. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_mm_checks_3f58117e9e.pdf)
- *Parts / Materials / References:*  
  - Where appropriate, identify which parts or consumables would typically be involved (using IPC/parts sections) and list all manual/safety/AD references used.  
- *Report Back Fields:*  
  - Targeted questions so that the next user turn can feed `guided_diagnostic_continuation` (e.g., “Did you find any fuel staining at the gascolator gasket?”).  

This mode explicitly aims at a **full diagnostic & corrective workflow**, not a one‑line suggestion.

### 5.2 `guided_diagnostic_continuation`  

**When to use**  

- There is an existing diagnostic thread for a given symptom family.  
- User messages indicate **feedback** on previous steps: “still persists,” “no change,” “I checked it,” “it passed,” “it failed,” “I balanced it,” “same issue,” “I replaced that part.”  

**Expected output shape**  

- *Acknowledge Previous Finding:*  
  - Reflect the user’s reported outcome (e.g., “You performed the gascolator inspection and did not find any leaks.”).  
- *Maintain Original Symptom Family:*  
  - Do not re‑classify unless the user explicitly states a different primary symptom.  
- *What Has Been Ruled Out:*  
  - Update the probable cause map to show which branches are now less likely, using simple language (“We can probably rule out X because Y passed”).  
- *Next Source‑Backed Diagnostic Action:*  
  - Provide the next logical inspection or test step from the same manuals and source families, not a fresh, unrelated suggestion. [scribd](https://www.scribd.com/document/258259825/r44-Mm-Powerplant)
- *Ask for Specific Feedback:*  
  - Pose one or two focused questions corresponding to that next step (e.g., “When you ran it at governed RPM after the adjustment, was the clutch light steady or flickering?”).  

Important: `guided_diagnostic_continuation` must **preserve continuity** — same symptom family, same high‑level investigation plan — and never silently “restart from scratch” unless the user explicitly signals a new problem.

### 5.3 `clarification_required`  

**When to use**  

- Safety‑critical context is missing (e.g., we do not know if the symptom occurred in flight vs. ground run).  
- Multiple high‑risk paths exist (e.g., “smoke in cabin” could be electrical, fuel, oil, or exhaust/CO).  
- The R44 variant (Raven I vs Raven II, fuel tank configuration, hydraulic vs non‑hydraulic) or configuration clearly matters, and retrieval cannot determine which applies.  
- Retrieved sources are insufficient to confidently pick a path.  

**Expected output shape**  

- *Explain Missing Context:*  
  - Clearly list what information is required (e.g., “I need to know whether this occurred in flight, during run‑up, or shut‑down.”).  
- *Ask Targeted Questions:*  
  - Three to five specific questions relevant to that symptom family (e.g., for fuel smell: location, intensity, visible leaks, recent maintenance, tank type).  
- *Avoid Procedural Guidance Until Context Known:*  
  - Refrain from giving detailed inspection or corrective actions; at most, repeat **high‑level safety advice** consistent with POH (“If this occurs in flight, follow POH emergency procedures and land as soon as practical/possible as applicable”). [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)

### 5.4 `no_source_guard`  

**When to use**  

- Retrieval for a technical maintenance question yields zero usable R44 references.  
- Retrieved text is irrelevant, non‑authoritative (e.g., forum posts) or not clearly applicable to the user’s configuration.  
- Only general aviation material appears, without R44‑specific authority.  

**Expected output shape**  

- *Current Assessment:*  
  - Summarize what the user asked and which symptom family it seems to relate to.  
- *Source Gap:*  
  - Explicitly state that no adequate, authoritative R44 sources were retrieved for this specific question.  
- *What I Need Next:*  
  - Either: ask for more detail that might allow better retrieval, or instruct the user to consult the official R44 documentation and/or a licensed engineer directly.  
- *Hard Guard:*  
  - Do **not** propose any inspection, adjustment, or corrective action and do **not** suggest that continued flight is acceptable.  

In `no_source_guard`, `sources[]` must remain empty or contain only clearly non‑procedural references (e.g., meta statements), and AeroMind must avoid inventions or “best guesses.”

***

## 6. Symptom Pattern Schema  

Every R44 symptom pattern must adhere to a shared schema so routing, retrieval, prompt composition, and diagnostic state logic can treat patterns consistently. All fields are provisional and require engineer sign‑off.  

### 6.1 Schema Fields  

Each symptom pattern includes:  

- `pattern_id`  
  - Unique identifier (e.g., `R44_VIBRATION_GENERAL_V1`).  
- `aircraft_scope`  
  - Specific aircraft types or variants this pattern applies to (e.g., `R44 / R44 II`, exclusions or notes for optional equipment).  
- `symptom_family`  
  - High‑level category name (e.g., `vibration_shaking_oscillation`, `fuel_smell_leak_contamination`).  
- `common_user_phrases`  
  - Non‑authoritative, user‑language examples that should map to this pattern (e.g., “helicopter shaking,” “hot rubber smell,” “clutch light stayed on”), drawn from mechanic phrasing and forums purely for language coverage. [youtube](https://www.youtube.com/watch?v=uuQAHmoRrBY)
- `normalized_symptoms`  
  - Canonical symptom tags (e.g., `main_rotor_vibration_forward_flight`, `fuel_smell_cabin_ground_run`).  
- `safety_gate`  
  - Conditions and rules for:  
    - In‑flight vs. ground.  
    - Loss of control indications.  
    - Smoke/fumes or fire risk.  
    - Critical warning lights (LOW OIL PRESSURE, LOW RPM, FIRE if fitted, etc.). [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
- `required_context`  
  - A structured list of data elements AeroMind should attempt to capture (e.g., phase of operation, warning lights, recent maintenance, weather, fuel state).  
- `likely_source_families`  
  - Ordered list of source families (e.g., `POH_warning_lights`, `MM_drive_system`, `MM_fuel_system`, `IPC_drive_belts`, `SB_fuel_tanks`, `AD_drive_belt`). [drs.faa](https://drs.faa.gov/browse/excelExternalWindow/FR-ADFRAWD-2024-28178-0000000000.0001?modalOpened=true)
- `retrieval_strategy`  
  - Query expansions (per symptom family), preferred filters (source type, section keywords), and required minimum number of chunks or tables.  
- `preferred_manual_sections`  
  - Provisional mapping to MM or POH sections by topic (e.g., “MM Section 2 – Inspection,” “Powerplant troubleshooting,” “POH Warning and Caution Lights”), to be precisely filled by engineers with correct section numbers. [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)
- `answer_mode_rules`  
  - Conditions to choose among `complete_inspection_sequence`, `guided_diagnostic_continuation`, `clarification_required`, and `no_source_guard`.  
- `investigation_sequence_template`  
  - Template describing how to build the Inspection Sequence section for this family (e.g., classification step → visual inspection → functional checks → deeper component checks).  
- `corrective_action_branches`  
  - Provisional structure of if/else branches keyed by inspection findings; must be parameterized to cite manual steps and be tagged ENGINEER_REVIEW_REQUIRED where not directly supported.  
- `verification_template`  
  - Template for post‑repair run‑up, ground run, or test flight checks, referencing POH/MM as appropriate. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_mm_checks_3f58117e9e.pdf)
- `feedback_handling`  
  - Rules for how to mark steps as completed/passed/failed and how to choose the next branch when the user reports outcomes.  
- `escalation_triggers`  
  - Conditions under which AeroMind should stop routine troubleshooting and recommend contacting maintenance, checking POH emergency procedures, or referencing AD/SB material.  
- `prohibited_behavior`  
  - Explicit constraints such as:  
    - “Do not advise continued flight with unresolved fuel smell.”  
    - “Do not contradict POH emergency procedures.”  
    - “Do not approve operation with known structural damage.”  
- `source_requirements`  
  - Specific requirements such as: “Must have at least one MM citation and any relevant SB/AD citation before proposing corrective action,” or “Do not rely on forum content for corrective steps.”  
- `engineer_review_needed`  
  - Flags and notes for engineers to review, including placeholder ENGINEER_REVIEW_REQUIRED tags where we inferred logic.  

### 6.2 How Each Field Is Used  

- **Routing**  
  - `symptom_family`, `common_user_phrases`, and `normalized_symptoms` guide classification from raw user text into the correct symptom pattern.  
- **Retrieval**  
  - `likely_source_families`, `retrieval_strategy`, and `preferred_manual_sections` guide the retrieval layer to pull the **right kind** of content from the R44 corpus instead of generic text.  
- **Prompt Composition**  
  - `required_context`, `safety_gate`, `investigation_sequence_template`, and `answer_mode_rules` inform prompt templates about what questions to ask, what safety caveats to include, and how to structure the output sections.  
- **Answer Generation**  
  - `probable cause map`, `corrective_action_branches`, `verification_template`, and `feedback_handling` drive the structure and content of the answer while keeping it grounded in sources.  

Everything in the pattern is **advisory to the AI runtime** and must be validated and possibly simplified by engineers before being turned into executable logic.

***

## 7. R44 Symptom Families  

Each subsection describes a **provisional** symptom pattern for a major R44 symptom family. The content is deliberately over‑specified so engineers can trim, correct, and map to exact manual sections.  

For each family, we provide: pattern ID, user phrases, safety gate, required context, source families, retrieval strategy, investigation workflow shape, corrective branches, verification, feedback handling, escalation triggers, prohibited behavior, engineer review notes, and an example output skeleton.

> Note: Specific section numbers, torque values, limits, and step details must be filled and adjusted by engineers based on the exact R44 manuals, IPC, SBs, and ADs. [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)

### 7.1 Vibration / Shaking / Abnormal Oscillation  

**Pattern ID**  
- `R44_VIBRATION_GENERAL_V1`  

**Symptom Family**  
- `vibration_shaking_oscillation`  

**Common User Phrases (examples, non‑authoritative)**  
- “helicopter shaking”  
- “vibration in hover”  
- “shakes in cruise”  
- “vertical hop”  
- “lateral shake”  
- “fore‑aft vibration”  
- “vibration after blade work”  
- “vibration and MR chip light”  
- “yaw vibration”  

**Safety Gate (provisional)**  

- Distinguish:  
  - *Phase*: ground taxi, hover, forward flight, climb, descent, autorotation.  
  - *Severity*: mild, moderate, severe (user language only; not authoritative).  
  - *Associated warnings*: MR CHIP, TR CHIP, clutch light, low RPM, unusual noise. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
- Priority actions:  
  - If vibration is **severe in flight**, associated with loss of control, chip light, or abnormal noises, the pattern should:  
    - Route user to POH emergency/abnormal procedures (e.g., land as soon as practical/possible per POH guidance) before any deep maintenance sequence. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
    - Advise inspection by licensed maintenance before next flight (no self‑clearance).  
- Ground‑run only vibration may route more directly to maintenance troubleshooting once safety gates pass.  

**Required Context**  

- Phase of operation when vibration occurs.  
- Whether vibration depends on:  
  - Airspeed and power setting.  
  - Hover vs forward flight.  
  - Specific RPM range.  
- Presence of:  
  - MR or TR chip lights.  
  - Clutch light behavior.  
  - Abnormal noises (whine, grinding, thumping).  
- Recent maintenance: rotor track/balance, blade replacement, drive belts, gearboxes.  
- Known structural damage (visible blade damage, bent components) – if present, escalate.  

**Likely Source Families**  

- R44 Maintenance Manual – rotor system, track and balance, vibration troubleshooting. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
- MM Powerplant / drive system sections for engine and drivetrain causes. [scribd](https://www.scribd.com/document/258259825/r44-Mm-Powerplant)
- POH – operational limits and any vibration‑related restrictions or warnings. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
- IPC – main rotor and tail rotor assemblies (for parts identification).  
- Safety Notices / ADs if related to drive system failures or structural issues. [atsb.gov](https://www.atsb.gov.au/sites/default/files/media/4918230/ao2011016_final.pdf)

**Retrieval Strategy (provisional)**  

- Seed terms from normalized symptom: `vibration`, `main rotor vibration`, `tail rotor vibration`, `track`, `balance`, `ground resonance`, `drive system`, `gearbox`, `chip`, `tail rotor drive shaft`.  
- Bias retrieval towards:  
  - MM troubleshooting sections containing “vibration” and “track and balance.” [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
  - Any MM references to “unusual noise” or “bearing noise” (e.g., admonitions to inspect bearings thoroughly if unusual noise is heard). [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
  - Chip light inspection procedures for MR/TR chip lights. [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)
- Explicitly avoid:  
  - Unrelated POH performance/weight sections unless needed for limits.  

**Investigation Workflow (shape, ENGINEER_REVIEW_REQUIRED)**  

1. **Classify Vibration**  
   - By phase (hover vs forward flight vs ground run).  
   - By axis: vertical hop, fore‑aft, lateral, yaw.  
   - By association with control inputs (collective changes, cyclic position, pedal inputs).  
2. **Safety Check**  
   - Verify no indications of imminent failure (severe vibration + unusual noise + chip light → POH procedures & immediate maintenance inspection). [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
3. **Main Rotor Track / Balance**  
   - Inspect blades for visible damage, erosion, delamination, leading edge condition (reference MM rotor inspection). [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
   - Review recent track/balance data and adjustments.  
   - ENGINEER_REVIEW_REQUIRED: specific steps to perform track/balance must be taken from MM track and balance procedures.  
4. **Drive Train / Gearboxes / Bearings**  
   - Inspect main/tail rotor gearboxes for leaks, mount integrity, and oil levels per MM. [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
   - Inspect drive shafts and couplings for damage or misalignment; pay attention where MM warns about unusual noise and bearing failure. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
   - Check for MR/TR chip indications and follow chip inspection procedures. [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)
5. **Tail Rotor & Yaw‑Related Vibration**  
   - If yaw vibration or pedal vibration is reported, link to tail rotor symptom family (7.3) while preserving main rotor path.  
6. **Engine Roughness vs Airframe Vibration**  
   - Distinguish engine roughness (RPM fluctuation, misfire feel, temperature anomalies) from pure airframe vibration; if engine roughness suspected, cross‑link to engine roughness family (7.7). [onderzoeksraad](https://onderzoeksraad.nl/wp-content/uploads/2023/11/624bc5f267a7b_rapport_robinson_r44_en_interactief.pdf)

**Corrective‑Action Branches (provisional)**  

- If main rotor blade structural damage suspected or confirmed → immediate “do not fly,” refer to MM for blade removal/inspection replacement and relevant AD/SB; prohibit any suggestion of continued operation. [aviation.govt](https://www.aviation.govt.nz/assets/aircraft/airworthiness-directives/helicopters/R44.pdf)
- If out‑of‑track/balance indicated → refer to MM track and balance procedures; do not invent target numbers or shortcuts (ENGINEER_REVIEW_REQUIRED for mapping). [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
- If chip indication → follow MR/TR chip procedures in MM; require chip plug inspection and cause determination before further flight. [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)
- If drive shaft, coupling, or gearbox anomalies → route to appropriate MM sections and treat as serious; mention accident evidence where tail rotor drive shaft failures caused control issues (for context only). [assets.publishing.service.gov](https://assets.publishing.service.gov.uk/media/5422ec53ed915d13710000e5/g-kazz_026664.pdf)

**Verification**  

- Post‑maintenance ground run at governed RPM, as specified in MM, verifying vibration levels, control feel, pedal position, and absence of unusual noise. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_mm_checks_3f58117e9e.pdf)
- If flight test is required, emphasize that only properly authorized personnel should perform it, following POH normal procedures. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)

**Follow‑Up Feedback Handling**  

- Preserve classification (e.g., “cruise vibration with no chip light”) across turns.  
- Mark each inspection step as complete/pass/fail based on user feedback.  
- On “I balanced it and still persists,” mark “track/balance path attempted” and shift emphasis to structural inspection, drive train, or engine causes without discarding earlier work.  

**Escalation Triggers**  

- Severe vibration + unusual noise + chip light → escalate to no‑flight recommendation and immediate inspection.  
- Tail rotor vibration with yaw control issues → cross‑link with tail rotor pattern and apply POH safety guidance. [aneclecticmind](https://aneclecticmind.com/2013/05/25/unanticipated-yaw/)

**Prohibited Behavior**  

- Do not simply say “balance the rotor” as the only answer.  
- Do not suggest continued flight when structural damage, severe vibration, or chip warnings are suspected.  
- Do not provide numerical track/balance targets, torque values, or RPM limits beyond what is retrieved.  

**Engineer Review Notes**  

- Engineers must:  
  - Map this pattern to exact MM sections for rotor inspection, track/balance, chip procedures.  
  - Confirm escalation thresholds and any references to ground resonance.  
  - Approve or revise branches related to tail rotor involvement and engine roughness.  

**Example Output Skeleton (`complete_inspection_sequence`)**  

- *Current Assessment:* Summary of phase, axis, severity, associated lights.  
- *Safety / Setup:* POH cautions, ground securing, rotor stopped, etc.  
- *Required Context:* Clarification questions about when and how vibration occurs.  
- *Probable Cause Map:* MR track/balance, blade condition, drive train, tail rotor, engine roughness.  
- *Inspection Sequence:* Ordered visual checks, track/balance checks, drive system checks (with citations).  
- *Corrective Action Branches:* For each key finding, route to MM procedures.  
- *Verification:* Ground run and, if needed, controlled test flight guidance.  
- *Parts / Materials:* Rotables/consumables referencing IPC and MM (ENGINEER_REVIEW_REQUIRED).  
- *Report Back:* “Tell me which of these findings you observed.”  

***

### 7.2 Main Rotor Track / Balance / Blade Condition  

**Pattern ID**  
- `R44_MAIN_ROTOR_TRACK_BALANCE_V1`  

**Scope**  

- Focused on main rotor track, balance, and blade condition when these are the **primary** concern, whether or not the user reports explicit vibration.  

**User Phrases (examples)**  

- “Rotor out of track.”  
- “Blade imbalance.”  
- “Track and balance issue.”  
- “Blade erosion / delamination concern.”  
- “Post‑maintenance vibration after blade work.”  

**Safety Gate**  

- Any sign of structural blade damage, delamination, or cracks must trigger **no‑flight** recommendation pending licensed inspection, consistent with general rotorcraft safety practice and the rationale behind ADs on rotor components. [aviation.govt](https://www.aviation.govt.nz/assets/aircraft/airworthiness-directives/helicopters/R44.pdf)
- If user mentions “parts missing,” “area of blade soft,” or obvious damage, do not treat this as a minor track/balance issue.  

**Required Context**  

- Phase(s) of flight where symptoms occur.  
- Recent rotor/track/balance work, blade replacements, repairs, or painting.  
- History of previous vibration and attempted corrections.  
- Aircraft serial number and model variant (where blade type differs).  

**Likely Source Families**  

- R44 MM: main rotor system, track and balance procedures, blade inspection criteria. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
- IPC: blade part numbers, hardware, fasteners.  
- SBs or ADs related to main rotor blades, swashplate, or blade attachment bolts. [aviation.govt](https://www.aviation.govt.nz/assets/aircraft/airworthiness-directives/helicopters/R44.pdf)

**Retrieval Strategy**  

- Query: `track`, `balance`, `main rotor blade`, `blade inspection`, `erosion`, `delamination`, `paint`, `vibration`, `swashplate`, `tip weights`.  
- Filter for MM rotor sections and any associated SB/AD.  

**Investigation Workflow (shape)**  

1. Confirm whether the issue is pure **track/balance** or includes **structural concerns**.  
2. For track/balance only:  
   - Review last track/balance results and reference MM procedures for repeating or adjusting.  
3. For structural concerns:  
   - Follow MM inspection guidance on cracks, erosion, bonding, trailing edge condition, and tip weights. [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
4. For post‑maintenance issues:  
   - Confirm whether components were re‑installed per MM and whether proper track/balance procedures were completed.  

**Corrective Action Branches**  

- Structural damage found → “do not fly,” follow MM for blade removal and replacement and consult any rotor‑related ADs. [aviation.govt](https://www.aviation.govt.nz/assets/aircraft/airworthiness-directives/helicopters/R44.pdf)
- Track/balance out but blades structurally sound → apply MM track and balance corrections.  

**Verification**  

- Track/balance verification runs and flight test profile as per MM and POH (ENGINEER_REVIEW_REQUIRED for exact procedure). [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)

**Prohibited Behavior**  

- Do not approve operation with suspected blade structural defects.  
- Do not infer that minor erosion is acceptable; refer to MM criteria or ask user to check manual limits.  

**Engineer Review Notes**  

- Engineers must provide definitive threshold criteria and exact MM section mapping.  

***

### 7.3 Tail Rotor / Yaw Control / Pedal Abnormality  

**Pattern ID**  
- `R44_TAIL_ROTOR_YAW_PEDALS_V1`  

**User Phrases**  

- “Yaw vibration.”  
- “Pedal vibration / stiff pedals.”  
- “Loss of tail rotor authority.”  
- “Abnormal tail rotor noise.”  
- “Tail rotor blade damage.”  
- “TR chip light on with vibration.”  

**Safety Gate**  

- **Loss of tail rotor authority** or uncontrollable yaw in flight must immediately route to POH emergency guidance (e.g., unanticipated yaw, tail rotor control failure) and “land as soon as possible/practical” language; maintenance steps come only after safe landing. [aneclecticmind](https://aneclecticmind.com/2013/05/25/unanticipated-yaw/)
- Tail rotor vibration with chip light, severe noise, or visible damage → treat as serious and high priority.  

**Required Context**  

- Phase: hover, low‑speed flight, cruise.  
- Direction of yaw (left/right) and pedal position.  
- Tail rotor chip light state.  
- Any recent tail rotor, gearbox, or pedal system maintenance.  
- Environmental conditions, especially wind direction when yaw occurs. [aneclecticmind](https://aneclecticmind.com/2013/05/25/unanticipated-yaw/)

**Likely Source Families**  

- MM: tail rotor system, gearbox, tail rotor controls (pedals, push‑pull tubes), chip procedures. [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)
- POH: tail rotor control failure, unanticipated yaw Safety Notice context. [aneclecticmind](https://aneclecticmind.com/2013/05/25/unanticipated-yaw/)
- IPC: tail rotor blades, gearbox, drive shaft, bearings.  
- Accident reports: tail rotor drive shaft failure as context only. [assets.publishing.service.gov](https://assets.publishing.service.gov.uk/media/5422ec53ed915d13710000e5/g-kazz_026664.pdf)

**Investigation Workflow (shape)**  

1. Safety classification (loss of authority vs. vibration only).  
2. Check for chip lights and follow chip inspection procedures. [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)
3. Inspect tail rotor blades for damage, erosion, foreign object impact.  
4. Inspect tail rotor drive shaft, bearings, and whirl mode damper region per MM. [assets.publishing.service.gov](https://assets.publishing.service.gov.uk/media/5422ec53ed915d13710000e5/g-kazz_026664.pdf)
5. Inspect pedals and linkage for binding, stiffness, or play.  

**Corrective Branches**  

- Chip findings, shaft/bearing anomalies, or blade damage → “do not fly,” refer to MM and any related ADs. [assets.publishing.service.gov](https://assets.publishing.service.gov.uk/media/5422ec53ed915d13710000e5/g-kazz_026664.pdf)
- Pedal stiffness without hydraulic issues → inspect controls for binding, cross‑reference hydraulic/control pattern (7.9).  

**Prohibited Behavior**  

- Do not attribute yaw issues to “pilot technique” without strong POH context; treat mechanical possibilities seriously.  
- Do not approve continued operation after tail rotor structural or drive anomalies.  

***

### 7.4 Fuel Smell / Fuel Leak / Fuel Contamination  

**Pattern ID**  
- `R44_FUEL_SMELL_LEAK_CONTAMINATION_V1`  

**User Phrases**  

- “Fuel smell in cockpit/cabin.”  
- “Fuel smell on ground run.”  
- “Visible fuel leak / stain.”  
- “Blue stain under helicopter.”  
- “Fuel smell after maintenance.”  
- “Water / debris in fuel.”  

**Safety Gate**  

- Any persistent fuel smell, especially in the cabin, must be treated as **safety‑critical** due to fire risk; POH and SB/AD history regarding fuel system and post‑impact fires underscores the importance of correct fuel system configuration and integrity. [aero-news](https://www.aero-news.net/index.cfm?do=main.ajTextPost&id=8afb7a56-0e46-423b-8f6c-794333c19fa8)
- AeroMind must **not** suggest continued operation with unresolved fuel leakage or smell.  

**Required Context**  

- Phase: preflight, ground run, flight, shut‑down.  
- Location of smell (cockpit, cabin, engine bay, external).  
- Visible leaks/stains at: tanks, lines, gascolator, drains, carburetor/fuel servo.  
- Recent fuel system maintenance (tanks, lines, gascolator, fuel system modifications such as bladder retrofit). [atsb.gov](https://www.atsb.gov.au/sites/default/files/media/4918230/ao2011016_final.pdf)
- Whether aircraft has bladder tanks vs. older aluminum tanks (important due to SB/AD history). [en.wikipedia](https://en.wikipedia.org/wiki/Robinson_R44)

**Likely Source Families**  

- MM: fuel system inspection and leak troubleshooting, gascolator, fuel lines, drains, selector valves. [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
- POH: fuel system description, fuel contamination notes, preflight fuel checks. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
- SBs/ADs: fuel tank retrofits, bladder tanks, fuel system safety improvements. [verticalmag](https://verticalmag.com/press-releases/fatal-accidents-prompt-new-zealand-ad-on-r44-fuel-tanks/)

**Retrieval Strategy**  

- Query: `fuel leak`, `fuel smell`, `gascolator`, `fuel line`, `fuel tank`, `bladder`, `drain`, `sniffle valve`, `fuel contamination`.  
- Focus on MM inspection steps: fuel lines, valves, gascolator bowl, fittings, tank vents, sump drains, fuel caps. [scribd](https://www.scribd.com/document/983511624/vp100-12mois)

**Investigation Workflow (shape)**  

1. Safety preface: treat fuel smell as serious; if in flight, follow POH abnormal/emergency guidance (e.g., land as soon as practical/possible) before maintenance detail. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
2. External inspection for visible leaks or stains at:  
   - Fuel tanks (seams, caps, sender units, vent lines). [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
   - Fuel lines and hoses (including spiral insulation in some configurations). [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
   - Gascolator bowl/gasket and drain (MM describes inspection, cleaning, gasket integrity). [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
3. Internal/cabin areas: smell near fuel selector valve, lines inside cabin bulkheads, etc. [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
4. Fuel contamination checks:  
   - Sumping drains and gascolator per MM and POH; look for water or debris. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)

**Corrective Branches**  

- Leak at fitting or hose → refer to MM for line replacement and torque/installation instructions. [scribd](https://www.scribd.com/document/258259825/r44-Mm-Powerplant)
- Gascolator gasket or bowl leakage → clean, replace gasket as per MM; reassemble and safety wire per instructions, verifying no leaks. [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
- Tank leak or vent problem → may involve SB/AD requirements and must be engineer‑reviewed; AeroMind should not propose repair schemes beyond what is clearly written.  

**Prohibited Behavior**  

- Do not say “smell is probably normal” without strong manual support (and even then, be conservative).  
- Do not give torque values or repair methods unless retrieved.  
- Do not approve flight with unresolved fuel smell or visible leakage.  

***

### 7.5 Drive System / Clutch / Belts / Hot Rubber  

**Pattern ID**  
- `R44_DRIVE_CLUTCH_BELTS_HOT_RUBBER_V1`  

**User Phrases**  

- “Clutch light stayed on / flickering.”  
- “Hot rubber smell.”  
- “Belts slipping.”  
- “Slow rotor engagement / rotor slow to turn.”  
- “Abnormal drive noise.”  
- “Tach split between engine and rotor.”  

**Safety Gate**  

- Clutch warning light behaviors have POH guidance for in‑flight actions; these must be followed before maintenance steps. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
- Reports of burning rubber smell combined with clutch light anomalies have been associated with drive belt issues and, in at least one case, belt disengagement leading to loss of drive. [atsb.gov](https://www.atsb.gov.au/news/2023/changes-robinson-drive-belt-stretching-guidance)

**Required Context**  

- Phase: start‑up, engagement, ground run, flight, shut‑down.  
- Clutch light behavior: on, off, flickering, duration.  
- Presence of burning rubber smell, unusual drive noise.  
- Recent belt replacement or clutch actuator adjustments. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_mm_1_badcf1597c.pdf)

**Likely Source Families**  

- MM: clutch actuator, V‑belt drive, belt tension checks, sheaves, tach alignment. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_mm_1_badcf1597c.pdf)
- POH: clutch light meaning and in‑flight procedures. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
- ADs/Service guidance: drive belt tension and actuator practices. [drs.faa](https://drs.faa.gov/browse/excelExternalWindow/FR-ADFRAWD-2024-28178-0000000000.0001?modalOpened=true)

**Investigation Workflow (shape)**  

1. If in flight during clutch light or burning smell → refer to POH emergency/abnormal procedure. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
2. On ground, inspect:  
   - Belt condition (cracks, fraying, contamination). [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
   - Sheaves and clutch shaft for oil leakage and fretting at bearing inner races (MM describes fretting and Telatemp indications). [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)
   - Actuator operation per MM and any updated guidance removing belt stretching practices. [atsb.gov](https://www.atsb.gov.au/news/2023/changes-robinson-drive-belt-stretching-guidance)
3. If tach split or drive noise present → inspect drive system components as per MM sections.  

**Corrective Branches**  

- Belts overheated/contaminated/damaged → replace per MM, check for root cause; **do not** re‑use heat‑damaged belts.  
- Clutch actuator anomalies → follow MM and any AD‑required modifications or checks. [drs.faa](https://drs.faa.gov/browse/excelExternalWindow/FR-ADFRAWD-2024-28178-0000000000.0001?modalOpened=true)

**Prohibited Behavior**  

- Do not advise “stretch belts by actuator” since this has been removed from guidance. [atsb.gov](https://www.atsb.gov.au/news/2023/changes-robinson-drive-belt-stretching-guidance)
- Do not suggest continued operation with hot rubber smell and drive anomalies.  

***

### 7.6 Warning and Caution Lights  

**Pattern ID**  
- `R44_WARNING_CAUTION_LIGHTS_V1`  

**User Phrases**  

- “Warning light on.”  
- “Clutch light flickering.”  
- “MR chip / TR chip light.”  
- “Low fuel light.”  
- “Alternator / low voltage light.”  
- “Low oil pressure.”  

**Safety Gate**  

- Many warning and caution lights have explicit POH emergency or abnormal procedures that must be the **first line of response**. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
- Example: LOW OIL PRESSURE in flight typically leads to landing as soon as possible; mechanical troubleshooting occurs after safe landing. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)

**Required Context**  

- Which light(s) exactly.  
- Phase of operation (ground, takeoff, cruise, landing).  
- Associated symptoms (vibration, smell, noise, instrument anomalies).  

**Likely Source Families**  

- POH: warning/caution light descriptions and procedures. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
- MM: maintenance follow‑up for underlying systems (e.g., alternator, chip detection, fuel sender, low fuel system). [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)

**Pattern Requirements**  

- Always **ask which light** and **phase of operation** if not already clear.  
- For active lights in flight, prioritize POH guidance.  
- For post‑event maintenance questions (“MR chip light came on, what should maintenance check?”), route to MM chip procedures and related system patterns (vibration, tail rotor, lubrication).  

**Prohibited Behavior**  

- Do not bury discussion of warning lights inside generic troubleshooting answers.  
- Do not override POH emergency procedures with maintenance suggestions.  

***

### 7.7 Engine Roughness / Power Loss / Temperature  

**Pattern ID**  
- `R44_ENGINE_ROUGHNESS_POWER_TEMP_V1`  

**User Phrases**  

- “Rough engine.”  
- “Power loss / low RPM.”  
- “High CHT / oil temperature.”  
- “Abnormal fuel flow.”  
- “Misfire during run‑up.”  

**Safety Gate**  

- In‑flight power loss, engine roughness, or significant temperature/pressure excursions must first be handled via **POH emergency/abnormal procedures**, such as reducing power, adjusting mixture/carb heat, and landing as appropriate. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
- Maintenance troubleshooting begins after safe landing.  

**Required Context**  

- In flight vs ground run.  
- RPM, manifold pressure, CHT, oil pressure/temperature readings relative to POH limits. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
- Carbureted vs fuel‑injected engine (Raven I vs Raven II).  
- Magneto/gov checks results.  
- Fuel quantity, recent refueling, and fuel type.  

**Likely Source Families**  

- MM powerplant troubleshooting, including ignition, fuel, induction system checks. [scribd](https://www.scribd.com/document/258259825/r44-Mm-Powerplant)
- POH engine limits and emergency procedures. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
- Safety/accident reports for context on magneto failures, exhaust issues (non‑authoritative, context only). [atsb.gov](https://www.atsb.gov.au/sites/default/files/documents/2026-05/AO-2026-009%20Final.pdf)

**Investigation Workflow (shape)**  

1. Distinguish between **operational** (POH) vs **maintenance** problem; ensure safety first.  
2. For roughness in run‑up only:  
   - Check magneto drop, carb heat effect, mixture settings.  
3. For persistent roughness:  
   - Inspect ignition (magnetos, plugs), fuel system (lines, injectors/carb, contamination), induction system (leaks, hoses), and exhaust for restrictions or damage. [onderzoeksraad](https://onderzoeksraad.nl/wp-content/uploads/2023/11/624bc5f267a7b_rapport_robinson_r44_en_interactief.pdf)

**Prohibited Behavior**  

- Do not propose adjusting ignition timing or other critical engine settings without explicit MM guidance.  
- Do not ignore elevated temperatures or low oil pressure reports.  

***

### 7.8 Electrical Faults  

**Pattern ID**  
- `R44_ELECTRICAL_FAULTS_V1`  

**User Phrases**  

- “Alternator light on.”  
- “Low voltage issue.”  
- “Battery not charging.”  
- “Starter issue.”  
- “Breaker keeps popping.”  
- “Navigation or radio inoperative.”  

**Safety Gate**  

- Electrical failure in flight can affect critical instruments and, in some cases, fuel pump operation; POH guidance for alternator failure/low voltage must come first. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)

**Required Context**  

- Which indicators: alternator light, volt/amp gauge readings, breaker status.  
- Whether fault is intermittent or continuous.  
- Recent electrical modifications or maintenance.  

**Likely Source Families**  

- POH: alternator/low voltage procedures. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
- MM electrical system troubleshooting, wiring diagrams, components. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
- IPC: alternator, regulator, battery, wiring harness.  

**Pattern Requirements**  

- Require the user to note whether any breakers are tripped and whether resetting them is allowed per POH/MM (ENGINEER_REVIEW_REQUIRED for specifics).  
- Avoid suggesting **component replacement** without first recommending basic circuit checks (wiring, connectors, grounds) as per MM. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)

***

### 7.9 Hydraulic / Control Stiffness / Abnormal Control Feel  

**Pattern ID**  
- `R44_HYDRAULIC_CONTROL_STIFFNESS_V1`  

**User Phrases**  

- “Cyclic stiffness.”  
- “Collective stiff / binding.”  
- “Pedals stiff.”  
- “Hydraulic caution light.”  
- “Controls stiff after maintenance.”  

**Safety Gate**  

- Loss or degradation of control authority is critical; POH guidance and Safety Alerts for hydraulic control checks emphasize DO NOT FLY when abnormal hydraulic resistance is felt. [helicoptertrainingvideos](https://www.helicoptertrainingvideos.com/safety-alert-r44-r66-hydraulic-controls-pre-takeoff-check/)

**Required Context**  

- Which control axis (cyclic, collective, pedals).  
- Whether hydraulics are ON or OFF.  
- Whether stiffness is continuous or intermittent.  
- Recent maintenance on servos, controls, or hydraulic system.  

**Likely Source Families**  

- MM: hydraulic system, control linkages, cyclic/collective/pedals inspection and freedom of movement checks. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
- Safety Alert: R44/R66 Hydraulics pre‑takeoff check (context). [helicoptertrainingvideos](https://www.helicoptertrainingvideos.com/safety-alert-r44-r66-hydraulic-controls-pre-takeoff-check/)
- POH: hydraulic failure procedures.  

**Pattern Requirements**  

- Distinguish mechanical binding from hydraulic assistance issues.  
- Ask whether pre‑flight control checks per MM/POH/Safety Alert were performed and passed. [helicoptertrainingvideos](https://www.helicoptertrainingvideos.com/safety-alert-r44-r66-hydraulic-controls-pre-takeoff-check/)

**Prohibited Behavior**  

- Do not advise flight if any resistance similar to hydraulics‑off condition is felt with hydraulics ON; this mirrors Safety Alert language. [helicoptertrainingvideos](https://www.helicoptertrainingvideos.com/safety-alert-r44-r66-hydraulic-controls-pre-takeoff-check/)

***

### 7.10 Smoke / Fumes / Exhaust / CO / Odor  

**Pattern ID**  
- `R44_SMOKE_FUMES_ODOR_V1`  

**User Phrases**  

- “Smoke in cockpit.”  
- “Electrical smell.”  
- “Hot rubber smell” (may overlap with drive system).  
- “Exhaust smell / possible CO.”  
- “Burning smell during ground run.”  

**Safety Gate**  

- Smoke or fumes in cabin are **highly safety‑critical**; carbon monoxide risk is emphasized by airworthiness bulletins regarding R44 exhaust system failures and the importance of CO detectors. [australianflying.com](https://www.australianflying.com.au/news/casa-warns-about-r44-exhaust-systems)
- In flight, POH smoke/fumes procedures must be primary.  

**Required Context**  

- Type of smell (fuel, oil, electrical, rubber, exhaust).  
- Phase (ground run, takeoff, cruise, descent).  
- Heating system usage (cabin heat on/off).  
- CO detector status if installed. [australianflying.com](https://www.australianflying.com.au/news/casa-warns-about-r44-exhaust-systems)

**Likely Source Families**  

- POH: smoke/fumes, CO exposure guidance. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
- MM: exhaust system, muffler, cabin heater shrouds, hoses. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
- Airworthiness bulletins on R44 exhaust failures and CO risk. [australianflying.com](https://www.australianflying.com.au/news/casa-warns-about-r44-exhaust-systems)

**Pattern Requirements**  

- Classify odor type and tie to the correct subsystem: fuel, electrical, rubber (belts), oil, exhaust/CO.  
- For possible CO or exhaust smell, emphasize CO detector use and treat as serious. [australianflying.com](https://www.australianflying.com.au/news/casa-warns-about-r44-exhaust-systems)

**Prohibited Behavior**  

- Do not downplay smoke/fumes; no suggestion to “continue flight and monitor.”  

***

### 7.11 Oil Pressure / Oil Temperature / Lubrication  

**Pattern ID**  
- `R44_OIL_PRESSURE_TEMP_LUBE_V1`  

**User Phrases**  

- “Low oil pressure.”  
- “High oil temperature.”  
- “Oil leak.”  
- “Oil smell / smoke.”  

**Safety Gate**  

- POH defines oil pressure and temperature limits and associated warning actions; low oil pressure in flight generally requires landing as soon as possible. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)

**Required Context**  

- Gauge readings relative to POH limits (idle vs flight ranges). [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
- Phase (start, warm‑up, flight, shutdown).  
- Location and severity of oil leak.  

**Likely Source Families**  

- POH: oil pressure/temperature limits and emergency procedures. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
- MM: engine lubrication system inspection and leak troubleshooting. [scribd](https://www.scribd.com/document/258259825/r44-Mm-Powerplant)

**Prohibited Behavior**  

- Do not approximate acceptable oil pressure/temperature; always quote or reference POH values when available. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)

***

### 7.12 Carburetor / Induction / Fuel-Air Symptoms  

**Pattern ID**  
- `R44_CARB_INDUCTION_FUEL_AIR_V1`  

**User Phrases**  

- “Carb ice suspicion.”  
- “Rough running at certain temps/humidity.”  
- “Induction leak.”  
- “Fuel smell near carburetor.”  
- “Mixture / acceleration problems.”  

**Safety Gate**  

- Carb ice and induction issues can cause power loss; in flight, POH carb heat and mixture procedures precede maintenance troubleshooting. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)

**Required Context**  

- Engine type (O‑540 vs IO‑540).  
- Ambient temperature and humidity when symptom occurs.  
- Carb heat usage and effects.  
- Run‑up data (mag drop, carb heat effect, mixture response).  

**Likely Source Families**  

- MM: induction system inspection, carb heat system, hoses, leaks, carburetor/fuel servo, fuel contamination. [scribd](https://www.scribd.com/document/258259825/r44-Mm-Powerplant)
- POH: carb ice indications and in‑flight mitigation. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)
- Accident/safety reports for induction leak examples (context). [onderzoeksraad](https://onderzoeksraad.nl/wp-content/uploads/2023/11/624bc5f267a7b_rapport_robinson_r44_en_interactief.pdf)

**Pattern Requirements**  

- Distinguish between **operational carb ice** events and **maintenance issues** such as leaking induction hoses, loose clamps, or contamination. [onderzoeksraad](https://onderzoeksraad.nl/wp-content/uploads/2023/11/624bc5f267a7b_rapport_robinson_r44_en_interactief.pdf)

***

## 8. Source Family Mapping  

**Provisional mapping – for engineer verification**  

| Symptom family                              | Primary source family                           | Secondary source family                                        | Avoid unless explicit / notes                         |
|---------------------------------------------|-------------------------------------------------|----------------------------------------------------------------|-------------------------------------------------------|
| Vibration / shaking                         | R44 MM rotor/drive troubleshooting [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual) | POH limits, chip procedures, ADs on rotors/drive [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf) | Forums only for phrasing, not corrective actions [pprune](https://www.pprune.org/rotorheads/501187-r44-voltage-regulator-advice-sought.html) |
| Main rotor track / balance / blade          | R44 MM rotor system & track/balance [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual) | IPC for blade P/N, SB/AD for rotor components [aviation.govt](https://www.aviation.govt.nz/assets/aircraft/airworthiness-directives/helicopters/R44.pdf)          | Do not derive limits beyond MM                        |
| Tail rotor / yaw / pedals                   | R44 MM tail rotor & controls [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)        | POH yaw/tail rotor procedures, Safety Notices [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)  | Avoid non‑R44 tail rotor LTE lore                     |
| Fuel smell / leak / contamination           | R44 MM fuel system inspection [scribd](https://www.scribd.com/document/983511624/vp100-12mois)              | POH fuel system/contamination, SB/AD on tanks [en.wikipedia](https://en.wikipedia.org/wiki/Robinson_R44) | YouTube/forums only for phrasing, not authority [youtube](https://www.youtube.com/watch?v=uuQAHmoRrBY) |
| Drive system / clutch / belts / hot rubber  | R44 MM clutch & V‑belt drive [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf) | POH clutch light procedures, ADs/bulletins on belt tension [atsb.gov](https://www.atsb.gov.au/news/2023/changes-robinson-drive-belt-stretching-guidance) | Avoid legacy “belt stretching” tips                   |
| Warning / caution lights                    | POH warning/caution sections [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)       | MM for system follow‑up [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)                         | Do not treat forums as definitive                     |
| Engine roughness / power / temp             | MM powerplant troubleshooting [scribd](https://www.scribd.com/document/258259825/r44-Mm-Powerplant)              | POH engine limits and emergency procedures [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)     | Accident reports as context only [atsb.gov](https://www.atsb.gov.au/sites/default/files/documents/2026-05/AO-2026-009%20Final.pdf)       |
| Electrical faults                           | MM electrical system & diagrams [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)    | POH alternator/low voltage procedures [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)          | Forums only for phrasing [pprune](https://www.pprune.org/rotorheads/501187-r44-voltage-regulator-advice-sought.html)                       |
| Hydraulics / control stiffness              | MM controls & hydraulics [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)    | POH hydraulic failure procedures, Safety Alert [helicoptertrainingvideos](https://www.helicoptertrainingvideos.com/safety-alert-r44-r66-hydraulic-controls-pre-takeoff-check/)  | Avoid generic hydraulic advice                        |
| Smoke / fumes / exhaust / CO                | POH smoke/fumes/CO guidance [australianflying.com](https://www.australianflying.com.au/news/casa-warns-about-r44-exhaust-systems) | MM exhaust systems, heater, hoses [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)              | Non‑R44 CO guidance only as general awareness         |
| Oil pressure / temperature / lubrication    | POH oil limits [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)                     | MM lubrication & leaks [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)                         | Do not guess acceptable readings                      |
| Carb / induction / fuel‑air                 | MM induction/carb/servo troubleshooting [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual) | POH carb heat and engine operation [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)             | Avoid generic carb ice lore not tied to R44           |
| Airworthiness / compliance questions        | ADs (FAA/EASA/NZ CAA) and SBs [aviation.govt](https://www.aviation.govt.nz/assets/aircraft/airworthiness-directives/helicopters/R44.pdf) | POH and MM for limitations context [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_2_0ef0d9066e.pdf)             | Forums and blogs not authoritative                    |

***

## 9. Retrieval Strategy  

### 9.1 Query Expansion from Symptom Family  

Instead of relying on the exact phrasing (“helicopter shaking”), AeroMind should use the **symptom family** to generate a **family‑specific query expansion set**.  

Example for `vibration_shaking_oscillation` (not hardcoded to “helicopter shaking”):  

- Base tokens: `vibration`, `shake`, `shaking`, `oscillation`.  
- System tokens: `main rotor`, `tail rotor`, `rotor track`, `rotor balance`, `drive system`, `gearbox`, `bearing`, `chip`, `ground resonance`.  
- Context tokens: `hover`, `forward flight`, `cruise`, `MR chip`, `TR chip`, `clutch light`.  

The retrieval system should combine these with **source‑family filters**, for example:  

- `("vibration" AND "main rotor")` in R44 MM rotor sections. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)
- `("chip" AND "MR" OR "TR")` in chip troubleshooting sections. [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)

Each symptom family defines its own expansion set (fuel smell → `fuel leak`, `gascolator`, `fuel line`, `drain`, `tank`, `bladder`, etc.). [scribd](https://www.scribd.com/document/983511624/vp100-12mois)

### 9.2 Source Filtering Rules  

- For **non‑regulatory maintenance** questions, prefer MM/POH over regulatory noise.  
- For **part numbers**, route to IPC first; avoid MM or POH unless needed for context.  
- For **procedures**, prioritize MM and any parsed procedure cache; include SB/AD if procedure is modified. [drs.faa](https://drs.faa.gov/browse/excelExternalWindow/FR-ADFRAWD-2024-28178-0000000000.0001?modalOpened=true)
- For **emergency/operational safety**, POH sections and any Safety Notices have precedence. [helicoptertrainingvideos](https://www.helicoptertrainingvideos.com/safety-alert-r44-r66-hydraulic-controls-pre-takeoff-check/)
- For **compliance questions**, filter specifically for ADs, service bulletins, and related regulatory documents. [federalregister](https://www.federalregister.gov/documents/2024/12/03/2024-28178/airworthiness-directives-robinson-helicopter-company)

If filtering leaves no authoritative R44 sources for a given maintenance question, the pipeline must trigger `no_source_guard` and **not** back off to generic or other‑type rotorcraft data.

### 9.3 Chunk Assembly  

When MM or POH content appears in tables (e.g., troubleshooting tables), the retrieval layer must:  

- Recognize that multiple rows in a table may apply to one symptom.  
- Retrieve and assemble **multiple contiguous rows** into a logical set.  
- Pass them to the reasoning layer as a **cause map**, not as isolated text.  

For example, a vibration table could list several causes (track, balance, blade damage, bearings, drive faults); answering based on only the first row is inadequate and risks missing critical checks. [scribd](https://www.scribd.com/document/891340909/Robinson-ModelR44-Maintenance-Manual)

AeroMind’s downstream logic should transform such tables into the **Probable Cause Map** and **Inspection Sequence** sections described in sections 5 and 10.

***

## 10. Answer Composition Strategy  

AeroMind’s diagnostic responses must follow consistent structures so mechanics can read them like a **checklist plus rationale**, not an essay.  

### 10.1 `complete_inspection_sequence` Structure  

- *Current Assessment:*  
  - Summarize symptom family, context, and any immediate safety concerns.  
- *Safety / Setup:*  
  - Describe relevant POH actions or cautions and basic maintenance setup per MM (e.g., master off, rotor stopped, secure aircraft), with citations. [shop.robinsonheli](https://shop.robinsonheli.com/wp-content/uploads/2021/07/r44_mm_100hour.pdf)
- *Required Context:*  
  - List any missing data and pose targeted questions.  
- *Probable Cause Map:*  
  - Group potential causes by subsystem, referencing MM troubleshooting tables or related sections.  
- *Inspection Sequence:*  
  - Ordered, numbered steps aligned with MM steps where possible, avoiding invented steps; label steps that are more inferred as ENGINEER_REVIEW_REQUIRED.  
- *Corrective Action Branches:*  
  - For each key finding, indicate the relevant MM procedure(s) to address it.  
- *Verification:*  
  - Summarize post‑repair ground run and checks using MM run‑up and POH references. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_mm_checks_3f58117e9e.pdf)
- *Parts / Materials:*  
  - Note where IPC part identification and consumables may be relevant, but avoid giving part numbers not actually retrieved.  
- *Report Back:*  
  - Explicitly ask for the results of one or more steps to feed into future `guided_diagnostic_continuation`.  

### 10.2 `guided_diagnostic_continuation` Structure  

- *Current Assessment:*  
  - Reflect new information from the user and update the symptom state.  
- *What This Rules Out:*  
  - Explain, in simple language, which causes are now less likely.  
- *Next Source‑Backed Step:*  
  - Provide the logical next inspection or verification step with citations.  
- *Report Back:*  
  - Ask for specific results from that step.  

### 10.3 `no_source_guard` Structure  

- *Current Assessment:*  
  - Restate the question and inferred symptom family.  
- *Source Gap:*  
  - Transparently explain that R44‑specific maintenance sources were not found or were insufficient.  
- *What I Need Next:*  
  - Suggest consulting the R44 MM/POH/ADs directly or a licensed engineer; optionally ask for extra detail that may enable better retrieval on the next turn.  

All answer compositions must **remind** the user, where appropriate, that AeroMind’s outputs are **provisional and non‑approved** and that final authority rests with official documents and licensed engineers.

***

## 11. Feedback Handling  

AeroMind must treat the diagnostic process as a **stateful investigation** rather than independent Q&A messages.  

### 11.1 Recognized Feedback Signals  

Phrases indicating progress or outcome (examples):  

- “Still persists,” “no change,” “same issue.”  
- “I checked it,” “I inspected X.”  
- “It passed,” “it failed.”  
- “I balanced it,” “I replaced it,” “done.”  

These should:  

- Preserve the **symptom family** and the **existing probable cause map**.  
- Mark specific steps in the investigation sequence as COMPLETED/PASSED/FAILED.  
- Avoid restarting from the initial symptom unless user clearly shifts to a new problem.  

### 11.2 Behavior Rules  

- When user reports “I replaced [component] and it still persists”:  
  - Mark the corresponding cause branch as **addressed but unresolved** and move to alternative causes.  
- When user reports a safety‑critical finding (e.g., “metal on chip plug,” “fuel leak confirmed,” “severe structural damage”):  
  - Trigger escalation logic: emphasize “do not fly,” and refer to MM and ADs as appropriate.  
- When user describes an **unsupported or non‑standard action** (e.g., stretching belts beyond MM guidance):  
  - Warn that this may not comply with current guidance and advise adhering to updated MM/SB/AD instructions. [atsb.gov](https://www.atsb.gov.au/news/2023/changes-robinson-drive-belt-stretching-guidance)

Feedback handling logic must remain **source‑bound**; the system should not infer new maintenance methods from user descriptions.

***

## 12. Implementation Guidance for Codex (Non‑Executable, Provisional)  

This section is for future engineers building routing and orchestration; it is **not** executable code and is **provisional**.  

### 12.1 Recommended Future Data/Logic Surfaces  

- Router output fields:  
  - `task_type` (engineering task type as per Section 4).  
  - `symptom_family` (pattern ID).  
- Diagnostic orchestrator:  
  - Maintains `answer_mode` (`complete_inspection_sequence`, `guided_diagnostic_continuation`, etc.).  
  - Uses `symptom_pattern` configuration for retrieval and answer structuring.  
- Retrieval layer:  
  - Accepts `source_family_preferences` and pattern‑specific query expansions.  
- Prompt composer:  
  - Applies pattern templates (Section 10) for answer composition.  
- State store:  
  - Tracks completed diagnostic steps, pass/fail, and escalation flags per conversation.  
- Source contract:  
  - Continue using `text_reply`, `sources[]`, and any `game_command` equivalents; maintain **message‑scoped sources** and **no‑source guard** semantics.  

### 12.2 Constraints to Preserve  

- `sources[]` must include only actual retrieved authoritative sources; do not embed guesses.  
- Maintain a **direct IPC route** for pure parts identification.  
- Keep logbook citation separation and part‑relevance logic as currently defined.  
- Exclude “Responses API” or any asynchronous channel from diagnostics until it is proven safe under this architecture.  

All implementation decisions must be reviewed by licensed engineers and, as applicable, operators’ safety managers.

***

## 13. Testing Strategy  

Future automated tests and human evaluations should verify that AeroMind’s diagnostic behavior follows this architecture. The following test categories are **provisional** and must be expanded by engineers.  

- **Initial defect → complete inspection sequence**  
  - Given an initial R44 defect description (e.g., “vibration in forward flight after track/balance work”), system returns a **multi‑step inspection sequence**, not a single suggestion.  
- **Short follow‑up → guided continuation**  
  - Given “I checked the gascolator and no leaks,” system continues the fuel leak pattern instead of restarting.  
- **Previous symptom preserved**  
  - After multiple turns, the original symptom family and probable cause map remain coherent.  
- **No‑source → no advice**  
  - When only non‑authoritative sources exist for a specific technical question, system triggers `no_source_guard` and **does not** provide maintenance guidance.  
- **Regulatory source suppression for non‑regulatory queries**  
  - Component questions (e.g., drive belts inspection) prefer MM; AD/regulation noise is suppressed unless relevant. [drs.faa](https://drs.faa.gov/browse/excelExternalWindow/FR-ADFRAWD-2024-28178-0000000000.0001?modalOpened=true)
- **Explicit regulation query keeps regulation sources**  
  - “What ADs affect the R44 drive belts?” must surface ADs and relevant SBs. [federalregister](https://www.federalregister.gov/documents/2024/12/03/2024-28178/airworthiness-directives-robinson-helicopter-company)
- **Part number query routes to IPC**  
  - “What is the P/N for the main rotor blade on my R44 II?” must route to IPC and not attempt fault diagnosis.  
- **Procedure query routes to MM procedure**  
  - “How do I inspect the gascolator?” → MM fuel system inspection sections. [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
- **Warning light query asks for light/phase/context**  
  - “Warning light came on” → system asks which light and phase, then uses POH/ MM accordingly. [robinsonstrapistorprod.blob.core.windows](https://robinsonstrapistorprod.blob.core.windows.net/uploads/assets/r44_poh_full_book_8a6211e78a.pdf)
- **Fuel smell query does not stop at one gascolator step**  
  - System must construct a full fuel leak/contamination path, not just check a single component. [scribd](https://www.scribd.com/document/983511624/vp100-12mois)
- **Vibration query builds multi‑cause map**  
  - “Shaking in hover” → probable cause map includes MR track/balance, blade condition, drive system, tail rotor, engine roughness (if appropriate). [scribd](https://www.scribd.com/document/258259825/r44-Mm-Powerplant)
- **“I balanced it and still persists” continues vibration diagnostic**  
  - System shifts emphasis to blade condition, drive train, or tail rotor.  
- **“What inspection should be performed?” returns full sequence**  
  - The answer must follow the `complete_inspection_sequence` template.  
- **“What is this component?” stays system explanation / parts identification**  
  - Does not escalate into maintenance procedure unless explicitly asked.  
- **“Can I fly?” routes to airworthiness/compliance**  
  - System should be conservative, referencing POH limits and AD/SB, and must avoid over‑authorizing operation; it may say it cannot determine airworthiness definitively. [verticalmag](https://verticalmag.com/press-releases/fatal-accidents-prompt-new-zealand-ad-on-r44-fuel-tanks/)

All tests should reiterate that AeroMind’s behavior is **provisional** and that final maintenance decisions rest with licensed engineers and operators.

***

## 14. Engineer Review Checklist  

This checklist is for licensed/qualified aircraft engineers (and, where applicable, operator safety personnel) to validate each symptom family pattern. The architecture itself is **provisional** until these items are explicitly approved.  

For **each symptom family** (vibration, fuel leak, clutch, etc.):  

1. **Required Context**  
   - Are the context fields (phase, indicators, recent maintenance, configuration) correct, sufficient, and non‑misleading?  
2. **Source Families**  
   - Are the primary and secondary source families appropriate (MM, POH, IPC, SBs, ADs)?  
   - Are any important sources missing (e.g., specific Safety Notices, new ADs)?  
3. **Escalation Triggers**  
   - Are safety‑critical triggers (loss of control, smoke/fumes, structural damage, chip lights) correctly identified and conservative enough?  
4. **Prohibited Behaviors**  
   - Are the explicit “do not” rules complete and aligned with safe practice and documentation (e.g., no continued flight with fuel smell, no unsupported belt stretching)? [aero-news](https://www.aero-news.net/index.cfm?do=main.ajTextPost&id=8afb7a56-0e46-423b-8f6c-794333c19fa8)
5. **Verification Steps**  
   - Are the verification sequences (ground runs, test flights) acceptable in scope and aligned with MM and POH?  
6. **Limits and Part Numbers**  
   - Are there any missing critical limits (RPM, pressures, temperature, allowable damage) that must be explicitly referenced from POH/MM?  
   - Are part‑identification flows appropriately routed to IPC without embedding unofficial P/Ns?  
7. **Answer Structures**  
   - Are the proposed answer modes and structures (Sections 5 and 10) usable and understandable for mechanics?  
8. **Follow‑Up Rules**  
   - Are the rules for step completion, pass/fail, and escalation after feedback realistic and sufficiently conservative?  
9. **Redlines / Modifications**  
   - Have all ENGINEER_REVIEW_REQUIRED notes been resolved, with references to specific manual/SB/AD sections?  
10. **Safety for Internal Testing**  
    - Is this symptom pattern safe enough to be used in **internal testing only**, with engineers reviewing outputs before they reach frontline maintenance staff?  

Engineers should document approvals and redlines for each pattern version (e.g., `R44_VIBRATION_GENERAL_V1` → `V2`), and the runtime must never treat an **unreviewed pattern** as authoritative.

***

## 15. Deliverable Requirements and Final Notes  

This document is intended to be saved as:  

`aircraft/docs/R44_SYMPTOM_PATTERN_ARCHITECTURE.md`  

Key requirements satisfied:  

- It defines a **symptom‑pattern architecture** that moves AeroMind from “symptom → chunk → one step” toward **complete, safety‑aware R44 diagnostic workflows** grounded in MM, POH, IPC, SBs, and ADs. [en.wikipedia](https://en.wikipedia.org/wiki/Robinson_R44)
- It distinguishes **conversation intent** from **engineering task type**, enabling different treatments of the same symptom phrase.  
- It defines **answer modes** and output shapes for complete inspections, guided continuations, clarification, and no‑source guard.  
- It introduces a **reusable Symptom Pattern Schema** and applies it across multiple R44 symptom families.  
- It maps **source families** explicitly, keeping forums and similar sources strictly for **phrasing**, not corrective actions. [pprune](https://www.pprune.org/rotorheads/501187-r44-voltage-regulator-advice-sought.html)
- It lays out **retrieval and chunk assembly strategies** suited to troubleshooting tables and multi‑step MM content.  
- It provides **implementation guidance** without implementing runtime code or changing prompts.  
- It proposes a **testing strategy** and a detailed **engineer review checklist**.  

Throughout, this architecture remains **provisional**, **non‑approved**, and **subject to revision** by licensed aircraft engineers and operators. AeroMind must remain **source‑bound**, must not invent maintenance facts or numerical limits, and must **withhold technical maintenance guidance** whenever authoritative R44 sources cannot be retrieved.