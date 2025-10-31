import React, { useState,useEffect } from 'react';

const SearchBar = () => {
  const [term, setTerm] = useState('');


  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault();

    console.log("print");
    // Do something 
    //alert(term);
    console.log("print");
  fetch(`https://nominatim.openstreetmap.org/search?q=${term}&format=json&polygon=1&addressdetails=1`)
  .then(response => response.json())
  .then(response => console.log("printed address: " + response))
  }

    useEffect(() => {

    console.log("print");



    },[])
  return (
    <div className="container">
      <form onSubmit={submitForm}>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          type="text"
          placeholder="Enter a term"
          className="input"
        />
        <button type="submit" className="btn">Submit</button>
      </form>
    </div>
  );
};

export default SearchBar;
