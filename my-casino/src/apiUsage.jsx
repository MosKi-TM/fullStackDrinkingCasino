const sendMise = async (response, setResponse, {name, mise, couleur}) => {
    const payload = { name: name, mise: mise, couleur:couleur };

    try {
      const res = await fetch('http://localhost:4000/mise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      setResponse(result.message);
      console.log(result.data)
    } catch (err) {
      console.error('Error posting data:', err);
    }
  };

  export {
    sendMise
  }