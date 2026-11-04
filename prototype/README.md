# Gospel Light Ministries International (glministries.org) Redesign Showcase

A high-fidelity, interactive UI/UX redesign prototype built for executive leadership and stakeholder presentation. This prototype directly addresses and resolves critical structural, visual, content, and conversion bottlenecks identified in the audit of the legacy WordPress site (`glministries.org`).

---

## Quick Start: Launching the Prototype

```bash
# 1. Install dependencies (Vite)
npm install

# 2. Start the local development server on port 3000
npm run dev

# 3. Open in your browser
http://localhost:3000
```
> **Note for Windows PowerShell:** If running scripts is restricted on your system, use `npm.cmd install` and `npm.cmd run dev`.

---

## Key Client Presentation Talking Points

Use these guided talking points during your client presentation with Apostle Daniel Makonnen, Pastor Aberham Bedasso, and ministry board members:

### 1. Navigation & Global Header
- **Current Site Issue:** Duplicate DOM navigation bars, raw database query URLs (`?page_id=28263`), and leaked template strings like *"Menu icon"*.
- **Redesign Solution:** A single sticky navbar featuring a live broadcast indicator, instant view switcher, bilingual switch (`EN` | `አማርኛ`), cart drawer badge, and an interactive **"UI Audit Callouts: ON/OFF"** presentation toggle.

### 2. Homepage & Event Management
- **Current Site Issue:** The homepage has been frozen with an outdated August 21-23, 2020 conference banner (*የተሃድሶ በረከቶች*) for over 5 years.
- **Redesign Solution:** Replaced with a dynamic 2026 Upcoming Conferences & Gatherings hub featuring the *Nov 14-16 Annual Revival & Leadership Conference* (Addis Ababa Aware HQ + Global Stream) and the *Dec 5 Diaspora Night of Worship* (Washington, D.C.), complete with interactive RSVP modals and calendar integrations.

### 3. Verified Synod Counters & Locations Directory (31+ Branches)
- **Current Site Issue:** The legacy site displays zeroed counters (`0` Addis Ababa, `0` East Showa, `2` Eastern Ethiopia, `0` Washington D.C.) and an unformatted plain-text list on `?page_id=28324`.
- **Redesign Solution:** Accurate counters reflecting verified locations across 4 synods (`3` Addis Ababa, `5` East Showa, `22` Eastern Ethiopia, `1` North America). Clicking any counter immediately filters the interactive 31-branch directory with search, contact numbers, and meeting schedules.

### 4. Dual Headquarters Clarity & Corrected Contacts
- **Current Site Issue:** Misspelled US contact email (`dc@glmministries.org`) and confusion between Addis Ababa and Washington D.C. operational schedules.
- **Redesign Solution:** Dedicated Dual Headquarters section presenting verified meeting times, physical addresses, direct telephone lines, and verified email addresses (`addis@glministries.org` and `dc@glministries.org`).

### 5. Consolidated About, History & Leadership
- **Current Site Issue:** Redundant duplicate pages (`?page_id=28263` and `?page_id=28322`), 12+ spelling errors (*"Apostel"*, *"Makonen"*, *"comunisim"*), and an empty stub page for Senior Pastor Aberham Bedasso (`?page_id=28597`).
- **Redesign Solution:** A unified 4-tab interface combining:
  1. *Vision, Mission & 8 Core Values* (sourced from Aware HQ `gospellightethiopia.org`).
  2. *History Timeline (1970s-2026)* from Derg-era underground prayer to international ministry.
  3. *Apostolic & Pastoral Leadership* with complete biographies for Apostle Daniel Makonnen and Pastor Aberham Bedasso.
  4. *Statement of Beliefs* detailing core biblical theology.

### 6. Sermons & Live Streaming Media Player
- **Current Site Issue:** Broken YouTube embeds, unconfigured search plugin checkboxes, and a misspelled *"Wedensday"* header.
- **Redesign Solution:** A custom video player with play/pause, scrub controls, playback speed, low-bandwidth MP3 download button, real-time keyword search, and thematic topic filtering across 6 curated bilingual messages.

### 7. Bilingual Book Store & Shopping Cart
- **Current Site Issue:** Four untitled *"Buy"* buttons on `?page_id=28327` with no product descriptions or cart experience.
- **Redesign Solution:** Rich publication cards for Apostle Daniel Makonnen's 4 major books with format selection (Print vs Digital PDF), price display in USD and ETB, and an interactive slide-over cart drawer with checkout simulation.

### 8. Dual-Currency Giving Portal (USD & ETB)
- **Current Site Issue:** A one-line stub on `?page_id=28360` failing to support diaspora donors or domestic Ethiopian church members.
- **Redesign Solution:** A dual-currency portal supporting:
  - **USD ($):** Card, Apple Pay, PayPal simulations with fund designations (Tithe, Aware HQ Building Project, Missions, Benevolence) and instant tax-deductible receipt generation.
  - **ETB (ብር):** Commercial Bank of Ethiopia (CBE) Account `1000012992448` with one-click copy, Telebirr `+251 911 716 848` with one-click copy, and branch deposit notification.

---

## Presentation Mode Instructions

During your meeting with the client:
1. Turn **"UI Audit Callouts" to ON** in the top navigation bar to highlight each structural fix with amber callout badges comparing the old site to the new design.
2. Toggle the **"EN | አማርኛ"** language switch to demonstrate complete bilingual support for both diaspora and local congregations.
3. Test the **Branch Directory search** by typing *"Adama"*, *"Aware"*, or *"ሐረር"*.
4. Test the **Book Store Cart** by adding a book and reviewing the slide-over drawer.
5. Demonstrate **ETB Giving** by clicking *"Copy Account Number"* to show the feedback tooltip.
