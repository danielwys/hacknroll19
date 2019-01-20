# hacknroll19

Execution Instructions:
1. Install node.js and npm with 'sudo apt install nodejs npm'

2. Clone this repository into a folder of your choice

3. In the cloned folder, run 'npm install download firebase-admin fs telegraf'

4. Run the bot with 'node wizardo.js'

Current Bugs:

1. UnhandledPromiseRejectionWarning: Error: 400: Bad Request: message text is empty (Appears when user interacts with bot, does not affect performance at all)

2. 'Yes' & 'No' inline buttons only able to display with an unprinted 'TEST' string (go and see hard to describe) (SOMETIMES THE TEST PRINTS OUT WHAT THE ACTUAL MOTHER OF)

3. Inline keyboards still available until the user leaves the bot's page

To-do Functionality:

1. Proper way to initialize bot (eg: /start or /report), right now bot just responds to any input and 'wakes up' ready to file a report

2. Data verification (proper matric numbers etc)

3. Ability to edit report (right now any mistake made requires the user to re-do the report from the start) (PARTIAL IMPLEMENT)

4. Ability for the user to check the status of his current reports (to see what stage of the repair-work has been completed)
