

### **Section 1. Contact**

* ### **Label:** Full name    **Type:** short text • **Required:** Yes 

* ### **Label:** Work email    **Type:** email • **Required:** Yes • **Validation:** must be company domain (no @gmail/yahoo/outlook) 

* ### **Label:** LinkedIn profile URL    **Type:** URL • **Required:** Yes 

* ### **Label:** Company website URL    **Type:** URL • **Required:** Yes 

* ### **Label:** Your role    **Type:** single select • **Required:** Yes    **Options:** Founder/CEO • Co-founder • CTO • COO • Other (specify) → *(If not Founder/CEO: show)* “Will the Founder/CEO attend the discovery call?” (Yes/No) 

### **Section 2. Founder availability (hard stop)**

* ### **Label:** The Founder/CEO can join a **90-minute discovery call within 7 days**.    **Type:** yes/no • **Required:** Yes    **Logic:** If **No** → show message “This consultation requires founder participation. Please reapply when available.” and **End**. 

### **Section 3. Fundraising timing**

* ### **Label:** When do you aim to **close your current/next round**?    **Type:** single select • **Required:** Yes    **Options:** 

  * ### In **≤ 14 days** 

  * ### In **15–45 days** 

  * ### In **46–90 days** 

  * ### **\> 90 days** / No active round 

* ### **Label (conditional):** Target close **date** (if known)    **Type:** date • **Required:** No • **Shown if:** any option except “\> 90 days / No active round” 

### **Section 4. Stage & round facts**

* ### **Label:** Current company stage    **Type:** single select • **Required:** Yes    **Options:** Pre-seed • Seed • Series A • Series B+ • Not sure 

* ### **Label:** Capital **raised to date (USD)**    **Type:** number (no commas) • **Required:** Yes • **Validation:** ≥ 0 

* ### **Label:** **Target round size (USD)**    **Type:** number • **Required:** Yes • **Validation:** ≥ 0 

* ### **Label:** Lead/commitments status    **Type:** single select • **Required:** Yes    **Options:** No lead identified • Lead identified (no commits) • **Soft-circled** (enter approximate $) • **Committed** (enter approximate $)    *(If Soft-circled or Committed → show numeric field “Approx amount (USD)”)* 

### **Section 5. Traction snapshot (pick one metric family)**

* ### **Label:** Pick your **primary traction metric** (the one investors care about most right now)    **Type:** single select • **Required:** Yes    **Options:** 

  * ### **ARR/MRR** (enter current MRR or ARR) 

  * ### **Usage** (enter DAU/MAU and 30-day growth %) 

  * ### **Commercial proof** (enter **\#** paid pilots / LOIs) 

  * ### **Waitlist / reservations** (enter **\#**) 

  * ### **R\&D** (no users/revenue yet) 

* ### **Conditional numeric fields** based on choice (Required if chosen). 

### **Section 6. Investor focus (IIPs)**

* ### **Label:** List up to **10 target investors** (firms or angels) **or** describe the precise investor **thesis** (geo, check size, sector).    **Type:** long text • **Required:** Yes    **Helper:** Examples: “US deeptech seed, $1–2M lead” / “APAC SaaS Series A, $5–10M, PLG”. 

### **Section 7. Newsability in the next 90 days**

* ### **Label:** Which **concrete events** are likely in the next **90 days**? *(check all that apply)*    **Type:** multi-select • **Required:** Yes (at least one or “None”)    **Options:** 

  * ### Product **launch / major release** 

  * ### **Pilot** go-live / first customer launch 

  * ### **Strategic partnership / integration** 

  * ### **Funding** announce/close 

  * ### **Executive hire / advisor** appointment 

  * ### **Regulatory / certification** milestone 

  * ### **None planned** 

* ### **For each checked (except None):** show **ETA date** (date field) \+ optional short text “Name/partner (if disclosable)”. 

### **Section 8. Constraints & disclosure posture**

* ### **Label:** Any **stealth, regulatory, or contractual** limits that could restrict what we can publish in the next 90 days?    **Type:** single select • **Required:** Yes    **Options:** None • Some limits (describe) • **Strict/stealth** (describe) 

* ### **Label (conditional):** Briefly describe the constraint and approval process (who signs off).    **Type:** long text • **Required:** Yes if Some/Strict 

* ### **Label:** Is an **NDA required** to review your materials?    **Type:** yes/no • **Required:** Yes 

### **Section 9. Commercial terms (hard gate)**

* ### **Label:** This is a **strategy consultation** (no media or investor meetings included). The fee is **promo-priced, cohort-limited**, **100% upfront**, and creditable to our Narrative Engine if engaged within 30 days. **Do you accept?**    **Type:** single select • **Required:** Yes    **Options:** **Yes, I accept** • No    **Logic:** If **No** → message “Thanks—this engagement requires acceptance of terms.” and **End**. 

### **Section 10. Materials (mandatory)**

* ### **Label:** **Upload your teaser or pitch deck** (PDF preferred).    **Type:** file upload • **Required:** Yes • **Allowed:** PDF/PPTX/Keynote 

* ### **Label:** Are you in **stealth** and unable to share a full deck?    **Type:** yes/no • **Required:** Yes    **If Yes →** show two **required** uploads: 

  * ### **5-slide redacted brief** (problem, solution, team, traction, round facts) 

  * ### **1-page round facts** (target size, use of proceeds, close date, commitments) 

### **Section 11. Consent**

* ### **Label:** “I understand this is a strategy consultation only; no media bookings or investor meetings are included.”    **Type:** checkbox • **Required:** Yes

* ### **Label :** “I acknowledge cohort pricing is time/slot limited” (checkbox).

* ### **Label :** “We run a four-cohort launch. The earliest cohort is offered at a nominal fee to reduce friction; later cohorts increase toward list price. Final pricing is presented upon acceptance.” (Checkbox)

* ### — Checkbox: I agree to these terms. 



