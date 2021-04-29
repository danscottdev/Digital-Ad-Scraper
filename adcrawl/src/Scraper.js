import React from 'react';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

const strapi = 'http://localhost:1337';

class Scraper extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      results: null,
      isLoading: false,
      isError: false,
      errorMsg: null,
      scrapeURL: ''
    }
  }

  handleURLChange = (e) => {
    this.setState({ scrapeURL: e.target.value });
  }
  enterPressed(event) {
    var code = event.keyCode || event.which;
    if (code === 13) { //13 is the enter keycode
      this.scrapeSite();
    }
  }

  scrapeSite = async () => {
    this.setState({ isLoading: true })
    try {
      const requestConfig = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      const response = await fetch(strapi + '/jobs/' + encodeURIComponent(this.state.scrapeURL), requestConfig);
      const json = await response.json();
      if (json.error) {
        console.log('no json', json);
        this.setState({ isLoading: false, isError: true, errorMsg: json });
        return false;
      }
      console.log('json', json);
      this.setState({ isLoading: false, isError: false, results: json });
    }
    catch (err) {
      this.setState({ isLoading: false })
      console.log(err);
    }
  }
  render() {
    return (
      <Container maxWidth="sm">
        <Box bgcolor="#e6efff" p={4} mb={5} >

          {this.state.results === null &&
            <div className="crawl-step">
              <div className={"loading " + (this.state.isLoading ? 'show' : 'hidden')}>looking for ads on {this.state.scrapeURL}...</div>
              <div className={"input " + (this.state.isLoading ? 'hidden' : 'show')}>
                <label>Enter the URL you want to crawl</label>
                <input type="text"
                  onChange={this.handleURLChange}
                  placeholdertext="enter the url you want to crawl"
                  onKeyPress={this.enterPressed.bind(this)}
                />
                <button onClick={this.scrapeSite}>RUN</button>
              </div>
            </div>
          }
          {this.state.results !== null &&
            <div className="crawl-step">
              <div className="scrape-results">
                <div className="ads-count">{this.state.results.ads.length} ad(s) found at <a href={this.state.results.url} rel="noopener noreferrer" target="_blank">{this.state.results.url}</a></div>
                <div className="fullpage-link"><a href={strapi + "/" + this.state.results.fullPage} rel="noopener noreferrer" target="_blank">view full page screenshot</a></div>
              </div>
              <div className="ads-found">
                {this.state.results.ads.map((ad, i) => {
                  return (
                    <div className="ad-item" key={i}>
                      <div>
                        <a href={strapi + "/" + ad.screenshot} target="_blank" rel="noopener noreferrer"><img src={strapi + "/" + ad.screenshot} alt={ad.position} /></a>
                        <br />
                        <div className="img-label"><a href={strapi + "/" + ad.screenshot} target="_blank" rel="noopener noreferrer">click to see full size</a></div>
                      </div>
                      <div className="ad-details">
                        <div><a href={ad.link} target="_blank" rel="noopener noreferrer">Ad Link</a></div>
                        <div className="ad-pos">ad position:<br />{ad.position}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          }
          <div className={"error " + (this.state.isError ? 'show' : 'hidden')}>
            {this.state.errorMsg ? this.state.errorMsg.error : ''}<br />
            {this.state.errorMsg ? this.state.errorMsg.message : ''}<br />
            {this.state.errorMsg ? this.state.errorMsg.statusCode : ''}
          </div>

        </Box>
      </Container>
    )
  }
}

export default Scraper;
