import { useState } from 'react';
import './App.css';
const uuid = require('uuid');

function App() {
  const [image, setImage] = useState("");
  const [uploadResultMessage, setUploadResultMessage] = useState("Please upload an image to authenticate.");
  const [visitorName, setVisitorName] = useState("placeholder.png");
  const [isAuth, setAuth] = useState(false);

  function sendImage(e) {
    e.preventDefault();
    setVisitorName(image.name);
    const visitorImageName = uuid.v4();
    const apiUrl = process.env.REACT_APP_API_GATEWAY_URL;
    const bucketName = process.env.REACT_APP_S3_AUTHENTICATE_NAME;

    fetch(`${apiUrl}/${bucketName}/${visitorImageName}.jpg`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpg'
      },
      body: image
    }).then(async () => {
      const response = await authenticate(visitorImageName);
      console.log(response)
      if (response.Message === 'Success') {
        setAuth(true);
        setUploadResultMessage(`Hi ${response['name']}, welcome!`)
      } else {
        setAuth(false);
        setUploadResultMessage('gagal login!')
      }
    }).catch(error => {
      setAuth(false);
      setUploadResultMessage("error");
      console.error(error);
    })
  }

  async function authenticate(visitorImageName) {
    const apiUrl = process.env.REACT_APP_API_GATEWAY_URL; 
    const requestUrl = `${apiUrl}/employee?` + new URLSearchParams({
      objectKey: `${visitorImageName}.jpg`
    });
    return await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(response => response.json())
    .then((data) => {
      return data;
    }).catch(error => console.error(error))
  }

  return (
    <div className="App">
      <h2>ML Project 1</h2>
      <form onSubmit={sendImage}>
        <input type='file' name='image' onChange={e => setImage(e.target.files[0])}></input>
        <button type='submit'>authenticate</button>
      </form>
      <div className={isAuth ? 'success': 'failure'}>{uploadResultMessage}</div>
      {/* <img src={ require(`./visitors/${visitorName}`) } alt='Visitor' height={250} width={250}></img> */}
    </div>
  );
}

export default App;
