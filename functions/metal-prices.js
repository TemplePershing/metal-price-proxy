const https = require("https");
const { parseString } = require("xml2js");

function fetchKitcoPrice(feedUrl) {
  return new Promise((resolve, reject) => {
    https.get(feedUrl, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        parseString(data, (err, result) => {
          if (err) return reject(err);
          try {
            const title = result.rss.channel[0].item[0].title[0];
            const match = title.match(/(\d{3,4}\.\d{2})/); // extract price like 2303.50
            if (match) {
              resolve(parseFloat(match[1]));
            } else {
              reject("No price found in title");
            }
          } catch (e) {
            reject(e.toString());
          }
        });
      });
    }).on("error", reject);
  });
}

exports.handler = async function () {
  try {
    const [goldPrice, silverPrice] = await Promise.all([
      fetchKitcoPrice("https://www.kitco.com/rss/gold.xml"),
      fetchKitcoPrice("https://www.kitco.com/rss/silver.xml")
    ]);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        gold: { price: goldPrice },
        silver: { price: silverPrice }
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.toString() })
    };
  }
};
