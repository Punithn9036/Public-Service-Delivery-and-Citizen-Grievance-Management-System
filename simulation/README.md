# JanSeva Municipal Discrete-Event Simulation & Benchmarking Suite

This directory contains the complete reproducibility and simulation suite for the IEEE research paper:

> **"JanSeva: A Hyperledger-Anchored, Multi-Channel Public Service Delivery and Citizen Grievance Redressal Architecture with Automated SLA Enforcement and WhatsApp Gateway Integration"**  
> *Authors:* Punith N., Deeksha Suvasini S., Maalvika C. H., Kavin Mahendhiran  
> *Institution:* School of Computer Science and Engineering, Presidency University, Bengaluru, India

---

## 1. Overview & Experimental Design (Section V-E)

The simulation benchmarks the performance of **JanSeva** against traditional municipal **Baseline FIFO** dispatching across $R = 30$ independent paired replications over a 30-day municipal evaluation horizon ($N \approx 1,200$ tickets per replication).

### Model Parameters
* **Diurnal Non-Homogeneous Poisson Arrival (NHPP):**  
  $\lambda(t) = \lambda_0 + A \cdot \cos\left(\frac{2\pi(t - \phi)}{24}\right)$  
  with $\lambda_0 = 40.0$ tickets/day, $A = 25.0$ tickets/day, and peak phase $\phi = 11.0$ (11:00 AM IST diurnal peak).
* **Municipal Workforce Pool:**  
  16 municipal field officers partitioned across 4 geographic wards and 4 departments (Revenue & E-Khata, Water Supply & Sanitation, Roads & Infrastructure, Emergency & Public Hazard). Officer active queue capacity is bounded at $K = 15$ concurrent investigations.
* **Dual Statutory & Priority SLA Resolution:**  
  $\text{SLA}_{\text{effective}} = \min(\text{SLA}_{\text{dept}}, \text{SLA}_{\text{priority}})$.  
  - Priority SLAs: Low ($S_g < 35 \implies 7\text{d}$), Medium ($35 \le S_g < 60 \implies 72\text{h}$), High ($60 \le S_g < 75 \implies 48\text{h}$), Urgent ($S_g \ge 75 \implies 24\text{h}$ statutory target, $48\text{h}$ emergency ceiling).
  - Department Statutory SLAs: Revenue/E-Khata (15d / 360h), Water Supply & Roads (7d / 168h), Emergency (48h).
* **JanSeva Algorithmic Optimizations:**
  1. *Dynamic Cross-Ward Spillover:* When a ward officer reaches capacity ($K \ge 15$), incoming tickets dynamically route to the least-loaded officer in the same department across adjacent wards.
  2. *Severity Preemption:* High-severity and urgent hazards ($S_g \ge 75$) preempt routine cosmetic grievances.
  3. *Multi-Tier Escalation:* Automated L1 alerts at 75% elapsed SLA and L2 reassignment to Supervising Executive Engineers upon 100% SLA breach.
  4. *Disciplinary Tribunal Exclusion:* Algorithm 3 excludes officers undergoing Strike 2 disciplinary suspension or Strike 3 termination.

---

## 2. Quick Execution & Reproduction

Both Python (`sla_simulation.py`) and Node.js (`sla_simulation.js`) implementations are provided. They require no external dependencies beyond the standard library / runtime.

### Running with Python (Version 3.8+)
```bash
py simulation/sla_simulation.py
# or
python3 simulation/sla_simulation.py
```

### Running with Node.js (Version 16+)
```bash
node simulation/sla_simulation.js
```

---

## 3. Benchmark Outputs (Table IV)

| Metric | Baseline FIFO | JanSeva Architecture | Relative Gain |
| :--- | :---: | :---: | :---: |
| **Mean Time to First Assignment** | 38.48 hours | 0.05 hours (3 mins) | **-99.9%** |
| **Statutory SLA Breach Rate (%)** | 38.60% ($\pm 2.1\%$) | 13.80% ($\pm 1.4\%$) | **-64.2%** |
| **Mean Resolution Time (Days)** | 11.10 days ($\pm 0.84$) | 3.80 days ($\pm 0.46$) | **-65.8%** |
| **Urgent Turnaround (< 48 hrs)** | 24.00% | 97.80% | **+307.5%** |
| **Citizen Re-Open / Appeal Rate** | 24.10% | 7.30% | **-69.7%** |

---

## 4. Statistical Rigor & Hypothesis Testing

* **Paired Student's $t$-Test on Resolution Time ($df = 29$):**  
  $\bar{D} = 7.30$ days, $\text{SE}_D = 0.146$ days, $t(29) = 50.00$, $p < 10^{-20}$, $95\%\text{ CI}: [7.00, 7.60]$ days.
* **Paired Student's $t$-Test on SLA Breach Rate ($df = 29$):**  
  $\bar{D} = 24.80\%$, $\text{SE}_{DP} = 0.444\%$, $t(29) = 55.89$, $p < 10^{-25}$, $95\%\text{ CI}: [23.89\%, 25.71\%]$.
* **Ticket-Level Independent Proportion $z$-Test ($n = 1,200$ tickets per arm):**  
  $z = 13.81$ (pooled) / $14.12$ (unpooled), $p < 0.001$, $95\%\text{ CI}: [21.4\%, 28.2\%]$.
* **Methodological Distinction for Reviewers:**  
  Because individual tickets processed within the same municipal month share officer pools and backlog states, ticket-level observations exhibit autocorrelation. While the ticket-level $z$-test confirms overwhelming significance ($p < 0.001$), the paired Student's $t$-test across $R = 30$ independent replications ($t(29) = 55.89$) provides the primary, unassailable statistical inference.
