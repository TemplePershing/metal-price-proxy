const https = require("https");
const { XMLParser } = require("fast-xml-parser");

function fetchKitcoPrice(feedUrl) {
  return new Promise((resolve, reject) => {
    https.get(feedUrl, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const parser = new XMLParser({ ignoreAttributes: false });
          const result = parser.parse(data);

          const title = result.rss.channel.item[0].title;
          const match = title.match(/(\\d{3,4}\\.\\d{2})/); // match 2303.50 etc.

          if (match) {
            resolve(parseFloat(match[1]));
          } else {
            reject("No price found in title text");
          }
        } catch (e) {
          reject("Parsing failed: " + e.message);
        }
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

