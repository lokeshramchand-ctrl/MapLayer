import React, { useState } from 'react';

const SearchBar = () => {
  const [term, setTerm] = useState('');

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault();

    // Do something 
    alert(term);
  }

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
