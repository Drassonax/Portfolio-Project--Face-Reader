import React from 'react'
import ReactDOM from 'react-dom'
import Clarifai from 'clarifai'
import 'normalize.css/normalize.css'
import './styles/styles.scss'

const app = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY
})

class App extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.getImageAnalysis = this.getImageAnalysis.bind(this)
    this.faceLocation = this.faceLocation.bind(this)
    this.state = {
      imgURL: '',
      analysisData: [],
      faceBoxes: [],
      faceIndex: '0',
      error: false,
      status: 'Ready'
    }
  }

  handleChange(event) {
    this.setState({
      imgURL: event.target.value,
      analysisData: [],
      faceBoxes: [],
      faceIndex: '0',
      error: false,
      status: 'Ready'
    })
  }

  faceLocation = (imgFace) => {
    const face = imgFace.region_info.bounding_box
    const image = document.getElementById('input-image')
    const width = Number(image.width)
    const height = Number(image.height)
    return {
        leftCol: face.left_col * width,
        topRow: face.top_row * height,
        rightCol: width - (face.right_col * width),
        bottomRow: height - (face.bottom_row * height)
    }
}

  getImageAnalysis() {
    this.setState({ status: 'Analyzing...' })
    app.models.predict(Clarifai.DEMOGRAPHICS_MODEL, this.state.imgURL)
      .then(
        (response) => {
          this.setState({ status: 'No human faces detected in this image' })
          console.log(response)
          this.setState({
            analysisData: response.outputs[0].data.regions,
            faceBoxes: response.outputs[0].data.regions.map((face) => this.faceLocation(face))
          })
          
        }, (err) => {
          this.setState({error: true})
        }
      )
  }

  handleClick = (event) => {
    document.getElementsByClassName('selected-box')[0].setAttribute('class', 'bounding-box')
    document.getElementById(event.target.id).setAttribute('class', 'selected-box')
    this.setState({ faceIndex: event.target.id })
}

  render() {
    return (
      <div>
        <div id="input-form">
          <input 
            type="text" 
            placeholder="Enter image URL here" 
            onChange={this.handleChange} 
            value={this.state.imgURL}
            id="url-input"
          />
          <button onClick={this.getImageAnalysis} id="url-button">Analyze</button>
        </div>

        <div id="container">
          <div id="img-container">
            {!this.state.imgURL ? <div id="image-placeholder"><div>Your image will be displayed here</div></div> : 
              <div>
                <img src={this.state.imgURL} id="input-image" />
                  {this.state.analysisData.map((face, index) => {
                    const box = this.state.faceBoxes[index]
                      return (
                        <div
                          key={face.id}
                          id={index}
                          className={index === 0 ? "selected-box" :"bounding-box"}
                          style={{top: box.topRow, right: box.rightCol, bottom: box.bottomRow, left: box.leftCol}}
                          onClick={this.handleClick}
                        />
                      )
                    })}
                </div>
              }
            </div>
            <div id="analysis-data">
                {!this.state.analysisData[this.state.faceIndex] ?
                    <div id="status">{this.state.status}</div>
                    :
                    <div id="analysis-complete">
                        <div className="section"><div className="category">Age:</div>
                          {this.state.analysisData[this.state.faceIndex].data.face.age_appearance.concepts.slice(0, 3).map((age) => {
                            return (
                                <div key={age.id}><strong>{`${age.name}`}</strong>: {`${age.value}`}</div>
                            )
                        })}</div><hr/>
                        <div className="section"><div className="category">Gender:</div>
                          {this.state.analysisData[this.state.faceIndex].data.face.gender_appearance.concepts.map((gender) => {
                            return (
                                <div key={gender.id}><strong>{`${gender.name}`}</strong>: {`${gender.value}`}</div>
                            )
                        })}</div><hr/>
                        <div className="section"><div className="category">Multicultural Appearance:</div>
                          {this.state.analysisData[this.state.faceIndex].data.face.multicultural_appearance.concepts.map((mca) => {
                            return (
                                <div key={mca.id}><strong>{`${mca.name}`}</strong>: {`${mca.value}`}</div>
                            )
                        })}</div>
                    </div>
                }
            </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))