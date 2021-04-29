'use strict';
require('strapi-utils');

const puppeteer = require("puppeteer");

// Helper functions for scraping a URL for ads

module.exports = {


  generateTimeStamp: () => {

    // Generate timestamp of scrape
    // Saved on it's own in the database as scrape metadata,
    // also used to generate slugs for individual screenshots

    let date = Date.now();
    let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),
      h = d.getHours(),
      m = d.getMinutes(),
      s = d.getSeconds();


    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day, h, m, s].join('');
  },


  setViewport: async (page) => {

    // Set puppetteer viewport prior to scanning page
    // Dimensions based on const defaultviewport, or puppetteer-measured dimensions of page, whichever is larger

    const defaultViewport = {
      height: 1920,
      width: 1280,
      deviceScaleFactor: 0.5
    };

    const bodyHandle = await page.$('body');
    const boundingBox = await bodyHandle.boundingBox();

    const newViewport = {
      width: Math.max(defaultViewport.width, Math.ceil(boundingBox.width)),
      height: Math.max(defaultViewport.height, Math.ceil(boundingBox.height)),
      deviceScaleFactor: 1
    };

    await page.setViewport(Object.assign({}, defaultViewport, newViewport));
  },


  scrollToAd: async (currentAd, page) => {

    // Scroll puppetteer browser to selected Ad
    // Used prior to taking screenshot

    const ad = await page.evaluate((header) => {
      const { top, left, bottom, right } = header.getBoundingClientRect();
      return { top, left, bottom, right }
    }, currentAd);

    await page.evaluate((ad) => {
      window.scrollTo(0, ad.top)
    }, (ad));

  },

  scrapeAdInfo: async (currentAd, page, timestamp, hostname, adInfo) => {

    // Return screenshot & info for currently-selected Ad


    const adID = await page.evaluate((header) => {
      return header.getAttribute('id');
    }, currentAd);

    //google ads have a container div just outside the iframe
    //with the same id as the iframe but with _container appended
    //we only want the iframe
    if (!adID.includes('container')) {
      let elemID = adID.replace(/\//g, '\\/').replace(/\./g, '\\.');
      const currAd = await page.$('#' + elemID);
      const frame = await currAd.contentFrame();

      if (frame) {

        // Take screenshot of current ad
        const screenshotKey = adID.replace(/\//g, '--');

        await currAd.screenshot({
          path: `public/screenshots/${timestamp}-${hostname}-${screenshotKey}.png`
        });

        adInfo.position = adID;
        adInfo.screenshot = `screenshots/${timestamp}-${hostname}-${screenshotKey}.png`;
        // console.log('adInfo', adInfo);


        // Get all links within current ad's iframe
        const hrefs = await frame.evaluate(() => Array.from(
          document.querySelectorAll('a[href]'),
          a => a.getAttribute('href')
        ));

        // console.log('hrefs', hrefs);

        if (hrefs.length > 0) {
          for (let linkHref of hrefs) {
            // console.log('------- hrefs', linkHref);

            // Ignore 'adsettings' & 'adsense support' links, which are often also present within the ad iframe
            if (!linkHref.includes('adssettings') && !linkHref.includes('adsense/support') && !linkHref.includes('google.com/maps/place/')) {
              let hrefArr = linkHref.split("adurl=");
              // console.log("href arr", hrefArr);

              let adLink = hrefArr[1];
              // console.log("adLink: ", adLink);


              // Sometimes Google Ads contain multiple nested URLs. Usually when ad link contains other tracking cookies
              // i.e. https://googleads/?adurl=https://loremipsumthirdpartytrackingcookie/?adurl=http://thisistheactualURLwewant.com
              // If so, we only want to return the ultimate target

              // Excluding the first http, select all nested URLs an split them into an array
              if (adLink && adLink.includes('http', 4)) {
                let temp = decodeURIComponent(adLink);
                let nestedUrls = temp.split('https://');

                // Common nested URLs that we can throw out
                const ignoreDomains = [
                  'adclick.g.doubleclick.net/pcs',  //google redirect
                  'ad.atdmt.com',  // cookie browser tracker domain
                  'd.agkn.com'     // facebook tracking cookie domain
                ]

                // Loop through all nested URLs, eliminating all that match our ignoreDomains array
                let finalUrl = nestedUrls.filter((link) => {

                  if (!link) {
                    return false;
                  }

                  let filterLink;

                  // Check current URL against ignoreDomains items
                  // there's probably a more elegant way to do this
                  for (let j = 0; j < ignoreDomains.length; j++) {

                    if (link.includes(ignoreDomains[j])) {
                      filterLink = false;
                      break;
                    } else {
                      filterLink = true;
                    }
                  }

                  if (filterLink) {
                    return link;
                  } else {
                    return false;
                  }
                });

                adLink = `https://${finalUrl[0]}`;
              }

              if (!adLink || adLink === undefined) {
                hrefArr = linkHref.split("adurl%253D");
                adLink = hrefArr[1];
              }

              if (!adLink) adLink = hrefArr;

              if (!adLink || adLink === undefined || adLink === '') {
                console.log("HREF link not found!");
              }

              // console.log('++++++ adLink', adLink)

              adInfo.link = decodeURIComponent(adLink);
              // adInfo.link = adLink;
              console.log("ad href saved: ", adInfo.link);

            }
          }
        } else {
          console.log("HREF not found for screenshotted ad");


        }


        // Return data to the adResults.ads array[]
        return adInfo;
      }
    } else {
      // console.log('is container div');
    }

  }

}