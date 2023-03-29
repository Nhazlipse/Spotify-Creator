const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

async function getRandomUser() {
  try {
    const response = await axios.get('https://randomuser.me/api/?nat=us');
    if (response.status === 200) {
      const userData = response.data.results[0];
      const name = `${userData.name.first} ${userData.name.last}`;
      return { name };
    } else {
      console.error('Error getting random user:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error getting random user:', error.message);
    return null;
  }
}

async function callAPIAndSaveAccountToFile(domain, password, numAccounts) {
  const url = 'https://spogentify.vercel.app/api/v1';
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  for (let i = 0; i < numAccounts; i++) {
    const userInfo = await getRandomUser();

    if (!userInfo) {
      console.error('Unable to get random user information');
      continue;
    }

    const email = `${userInfo.name.replace(/\s+/g, '')}${Math.floor(Math.random() * 10000)}@${domain}`;
    const params = { name: userInfo.name, email, password };

    try {
      const response = await axios.get(url, { params });

      if (response.status === 200) {
        const accountDetails = {
          name: userInfo.name,
          email: email,
          password: password,
          response: response.data,
        };

        fs.appendFile('accounts.txt', `${email}|${password}\n`, (err) => {
          if (err) {
            console.error('Error while saving account details to file:', err);
          } else {
            console.log(`\x1b[36mEmail\x1b[0m : \x1b[32m${params.email}\x1b[0m success saved to accounts.txt`);
          }
        });
      } else {
        console.error('Error calling API:', response.statusText);
      }
    } catch (error) {
      console.error('Error calling API:', error.message);
    }
  }

  rl.close();
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What is your domain name? ', (domain) => {
  rl.question('What is your password? ', (password) => {
    rl.question('How many accounts do you want to generate? ', async (answer) => {
      const numAccounts = parseInt(answer);
      if (isNaN(numAccounts)) {
        console.error('Invalid input, please enter a number.');
        rl.close();
        return;
      }

      await callAPIAndSaveAccountToFile(domain, password, numAccounts);

      rl.close();
    });
  });
});
