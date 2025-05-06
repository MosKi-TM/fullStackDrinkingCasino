const BASE_URL = `http://${window.location.hostname}:4000`;

const sendMise = async (response, setResponse, { name, mise, couleur }) => {
  const payload = { name, mise, couleur };

  try {
    const res = await fetch(`${BASE_URL}/mise`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    setResponse(result.message);
    console.log(result.data);
  } catch (err) {
    console.error('Error posting data:', err);
  }
};

const spinRoulette = async () => {
  try {
    const res = await fetch(`${BASE_URL}/spin`);
    const data = await res.json();

    spinWheel(data.value); // Start animation
    setPendingRollData(data); // Delay update until animation ends
  } catch (err) {
    console.error('Error fetching spin result:', err);
  }
};

export {
  sendMise,
  spinRoulette
};
