# Portfolio: Digital Ad Scraper

Background: Assisted in building a full-stack JavaScript app that takes a user-entered URL and scrapes that site for certain advertising-related content. For each result found within the scraped site, various metadata is saved along with a screenshot and a timestamp. Results are saved to a database, which can then be viewed, edited, or deleted by the user. Uses Strapi.io and Node.js on the back-end, SQLite as the database, and React.js on the front-end.

Front end: /adcrawl folder [React.js]
Back end: /job-api folder [Node.js / Strapi.io]
Database: via SQLite [not included in repo]

--> most of the relevant back-end code lives in the /job-api/api/job/controllers/ folder

Some files & directors were excluded from this repo in the interest of client confidentiality. As such it will likely not run on its own, and is intended only for portfolio code-review purposes.

--------------------------------------------------------

## original readme:
** html/job-api/

- yarn install
- yarn develop

** html/adcrawl/

- yarn install
- yarn start

** project notes

- both projects must be running simultaneously as /job-api is the backend while /adcrawl is the front end
- make sure you aren't running any ad blockers
- use https://deadline.com as a trial
- screenshots of ads should be saved in /job-api/public/screenshots/
- this is a work in progress so the scraping might not always return ads depending on what the entered site is displaying


-- Update Permissions in Strapi Admin Panel:
--  http://localhost:1337/admin/plugins/users-permissions/roles
-- Click 'Public'
-- Under 'Permissions' - 'Application' - check box for 'find' to enable API
-- Otherwise, API will return 403 Forbidden error

-- Also manually create 'screenshots' folder in /job-api/public/