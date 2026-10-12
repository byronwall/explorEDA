# Customer-instance update

Byron added a fourth track on October 11, 2026, after the first query run began.

“what is the best hosted server approach for all this? Can we do serverless? Cloudflare? Or should we run on a VPS? Or something else?”

“My main goal is to be able to spin up a dedicated instance for each paying customer. I want maintenance to be minimal and automation to be very high to complete.”

This updates the deployment audience and success criteria. It does not authorize a deployment or application implementation.
The first three tracks still own their original technical decisions. Interpret their one-server assumption as per customer instance.
The hosting track must evaluate isolation choices, operating effort, and automated lifecycle management across instances.
The exact isolation unit, provider, budget, customer count, database location, and availability target remain open.
The research should propose defaults and state the decision triggers. Do not invent requirements for these unknowns.
