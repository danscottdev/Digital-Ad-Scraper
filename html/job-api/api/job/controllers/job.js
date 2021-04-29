'use strict';
require('strapi-utils');
const puppeteer = require("puppeteer");

const scrapeFunctions = require('./functions.js');


module.exports = {

    // Scan user-entered URL and return screenshots & ad info:
    find: async ctx => {
        let adResults = {};
        adResults.ads = [];

        const browser = await puppeteer.launch({
            headless: true
        });

        const page = await browser.newPage()

        const pageURL = ctx.params.url
        let hostname = pageURL.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
        hostname = hostname.replace(/^(?:http?:\/\/)?(?:www\.)?/i, "").split('/')[0];
        hostname = hostname.replace(".com", "").replace(".net", "");

        let timestamp = scrapeFunctions.generateTimeStamp();

        adResults.url = pageURL;
        adResults.name = hostname

        await page.goto(pageURL, {
            waitUntil: 'domcontentloaded'
        });


        // SET PUPPETTEER PAGE VIEWPORT
        await scrapeFunctions.setViewport(page);


        // Screenshot full page
        const saveScreen = async (page, key = 'debug-screen') => {
            await page.screenshot({ fullPage: true, path: `public/screenshots/${timestamp}-${hostname}.png` });
            adResults.fullPage = `screenshots/${timestamp}-${hostname}.png`;
            // console.log('full-page screenshot');
        };

        await page.evaluate(() => window.scrollTo(0, Number.MAX_SAFE_INTEGER));
        await page.waitFor(10000);
        await saveScreen(page, 'full-page');


        // Begin Scanning Page for Ads
        let adInfo = {};

        const elements = await page.$$('[id^="google_ads"]')

        // Cycle through all Ad elements
        for (let i = 0; i < elements.length; i++) {

            adInfo = {};

            // Scroll puppetteer brower to currently-selected Ad
            await scrapeFunctions.scrollToAd(elements[i], page);

            try {
                // Scrape info (and take screenshot) for current ad
                let currentAdInfo = await scrapeFunctions.scrapeAdInfo(elements[i], page, timestamp, hostname, adInfo);

                if (currentAdInfo) {
                    adResults.ads.push(currentAdInfo);
                }

            } catch (e) {
                // if element is 'not visible', spit out error and continue
                console.log(`couldnt take screenshot of element with index: ${i}. cause: `, e)
            }
        }
        await browser.close()


        // Add results to database
        strapi.query('job').create({
            Title: adResults.name,
            URL: adResults.url,
            screenshotFull: adResults.fullPage,
            ads: adResults.ads
        }).then(function (result) {
            // After adding the 'job', add each 'ad' to the database as well
            // Ads are stored in their own table, and are linked to specific jobs via 'job_id'
            adResults.ads.map((ad) => {
                strapi.query('ad').create({
                    job_id: result.id,
                    ad_link: ad.link,
                    ad_position: ad.position,
                    ad_screenshot: ad.screenshot
                });
            })
        });

        return adResults;
    },



    // Show all rows in Database
    all: async ctx => {
        let results;
        results = await strapi.query('job').find();
        return results;
    }

};

/*
    Problem: Sometimes <a> link isn't inside of targeted iframe. Example: https://theatlantic.com , header pop-down ad.
        <gpt-ad> (google publisher tag)
            <div> google_ads container
                <iframe>
            </div>
            <div>
                <a href="AD_URL">
            </div>
        </gpt>

    if(no link){
        check container parent for <gpt-ad>
        if so, scan for link
    }
// Problem: Some ads rotate on a timer, ad container iframe contains multiple nested iframes
                        // let nestedFrames = await frame.$('iframe');
                        // console.log(nestedFrames);




                        ** Problem: Sometimes ads consist of multiple e-commerce links. i.e. "SHOP Rugs:" ad, which then has multiple different thumbnail links to specific product sale pages


*/


/*

if(multiple urls){
    return array => [combined, url1, url2, ..etc]
    store array in db
    front end option to select correct?
}

if(adclick.g.doubleclick) =>
    adurl
    if (adurl === )



https://adclick.g.doubleclick.net/pcs/click?xai=AKAOjstahZsjozWAOmJQCGsSpowFPKVRKleRGoqriHY9o3QuPbZtVdJ1aW14crWVzLOZaLpeubvi4PAogXDojxCTUoeEAfnt7XLcuO6L7UuxW86KnDSWBqs5KTLnE8eYAq6sXHVEcF0SR4DgDiNEbjoCdH0Bn8tn8pBhyaB9MOjhIAwwBdOyWiTirJy6ccj0IE8KVg2DYRuDZNvlPwzId7h8oGJNkR7q1Wl48Pm1xte2G_RVeyRFtwp08ktyTt3byutjktOA5kvbp9kNKHSNbuAJ&sai=AMfl-YRxuxcLTVBUWxq6Bxhwu1duPPa0oWpQzR8OZ_Tk-a8WrDQlEQg_5Xh_zWP6HsVPVJ7I_bkqQGwRoIQz_edzyTS6JPF-JfUhfz34VZQybBRftk-gFePlFFz5PY-uW_4&sig=Cg0ArKJSzCzdMxPy1CLZEAE&urlfix=1
    &adurl=https://ad.atdmt.com/c/img%3Badv%3D11007220416659%3Bec%3D11007231623747%3Badv.a%3D9851370%3Bc.a%3D24748261%3Bs.a%3D3092522%3Bp.a%3D289077853%3Ba.a%3D482317352%3Bcache%3D4009701524%3Bqpb%3D1%3B%3Fh%3Dhttps://d.agkn.com/pixel/2389/%3Fche%3D4009701524%26col%3D24748261,3092522,289077853,482317352,141303957%26l1%3Dhttps://www.hbomax.com/coming-soon/flight-attendant%3Futm_id%3Dcm%7C24748261%7C3092522%7C289077853%7C141303957%26dclid%3D%25edclid!

https://adclick.g.doubleclick.net/pcs/click?xai=AKAOjss5mlaP_oNmUxmneX5VvVYFGbfaEgbsF4xaQaAMsXvJkmwkXKFut82DoQwV1DEGXtMILGWDs3xeSfTGKSymW5apDqqg6hn6UykmMdTM22QUEsP7oO0WK7-oZ_B_7hcIg7H7lSINjJp66qfq0u499NvGbNZySLqlBGSAQ1yqv5NGnIslXsZyhzY1a7qc3260x9Nsp7kgO-lpnIHmC59ZAc6P7wZUMZADH1BukLxW3Tc4IPmiBhrwoVU3yaM2f1cHogEtI_EE-XqL&sai=AMfl-YTY31scf1rdQXifk0BG1UfhADjhsVXMALtQnpp5gPt2v3nw37N2kjVjhCFJB5o7jMyWFwYXeAll2k52Vao-6HmTcGJe7wlgD_gSnKJOC1nosX_zrnWGHmP_NgYi210&sig=Cg0ArKJSzKH0QEh2qUlVEAE&urlfix=1&adurl=https://ad.atdmt.com/c/img%3Badv%3D11007220416659%3Bec%3D11007231623747%3Badv.a%3D9851370%3Bc.a%3D24748261%3Bs.a%3D3092522%3Bp.a%3D288828347%3Ba.a%3D482317394%3Bcache%3D1999772812%3Bqpb%3D1%3B%3Fh%3Dhttps://d.agkn.com/pixel/2389/%3Fche%3D1999772812%26col%3D24748261,3092522,288828347,482317394,141914626%26l1%3Dhttps://www.hbomax.com/coming-soon/flight-attendant%3Futm_id%3Dcm%7C24748261%7C3092522%7C288828347%7C141914626%26dclid%3D%25edclid!
https://adclick.g.doubleclick.net/pcs/click?xai=AKAOjssZlTVB5XsxtWyAxJ0Mm2XoU52XTfwohgOAk70ZuYy4ycVn1irG-l4LW1e8_XmaMytRvZ6Q6_XobOasQcnefneQ-IXQdtEcGHBMzRkonC6J64y_m9mPUPEb2yX0ENsVt2tKN-Zb1hsxdOxgHWOqJL8-doowr9g-DJjPaLUabSUHd84DinKKGR3VC9720H8taUBA-dygJo11JA42OLHVsfZUqq2ipL5kEvRctqhTPsC85Pu8dQa9JpjRptLsAliSycPReDDsaHFwVg&sig=Cg0ArKJSzDYrutOXZxruEAE&urlfix=1&adurl=https://ad.atdmt.com/c/img%3Badv%3D11007220416659%3Bec%3D11007231623747%3Badv.a%3D9851370%3Bc.a%3D24748261%3Bs.a%3D3092522%3Bp.a%3D288994737%3Ba.a%3D482316230%3Bcache%3D1918116189%3Bqpb%3D1%3B%3Fh%3Dhttps://d.agkn.com/pixel/2389/%3Fche%3D1918116189%26col%3D24748261,3092522,288994737,482316230,141679164%26l1%3Dhttps://www.hbomax.com/coming-soon/flight-attendant%3Futm_id%3Dcm%7C24748261%7C3092522%7C288994737%7C141679164%26dclid%3D%25edclid!







-----------------------
                            // Get all nested iframes
                            let nestedFrames = await frame.$$('iframe');
                            // console.log("nested frames, ", nestedFrames);

                            // Loop through nestedFrames
                            for (let j = 0; j < nestedFrames.length; j++) {

                                let currentNestedFrame = await nestedFrames[j].contentFrame();

                                // Re-scan for hrefs
                                let nestedHrefs = await currentNestedFrame.evaluate(() => Array.from(
                                    document.querySelectorAll('a[href]'),
                                    a => a.getAttribute('href')
                                ));

                                // console.log("nested href array: ", nestedHrefs);
                            }





*/