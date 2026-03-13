const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testFlow() {
  console.log('Testing App Flow...');
  try {
    // 1. Register
    console.log('1. Registering Shop...');
    let res = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Owner', email: 'test_' + Date.now() + '@shop.com', password: 'pass', shopName: 'My Shop'
    });
    const token = res.data.token;
    console.log('Success!', res.data.shopName);

    // 2. Upload Job
    console.log('2. Creating Job...');
    const form = new FormData();
    form.append('customerName', 'Bisha');
    form.append('files', fs.createReadStream('test.jpg'));

    res = await axios.post('http://localhost:5000/api/jobs', form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
    });
    const jobId = res.data._id;
    const fileId = res.data.files[0]._id;
    console.log('Success! Job ID:', jobId);

    // 3. Process Image
    console.log('3. Processing Image...');
    res = await axios.post(`http://localhost:5000/api/jobs/${jobId}/process-image`, {
      fileId, 
      preset: { resizeMode: 'resize', imageFormat: 'jpg', dpi: 300 }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Success!', res.data.message);
    
    // Cleanup
    fs.unlinkSync('test.jpg');
    console.log('ALL TESTS PASSED!');

  } catch (err) {
    console.error('Test Failed:', err.response ? err.response.data : err.message);
  }
}

testFlow();
