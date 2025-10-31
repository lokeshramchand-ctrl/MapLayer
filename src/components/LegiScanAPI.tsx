import { useState, useEffect } from 'react'

async function getBills(data) {
	const bill_ids: number[] = [];
	const bill_titles: string[] = [];
	var results: any = data["searchresult"]["results"];
	for(var i = 0; i < data["searchresult"]["summary"]["count"]; i++){
		var bill_id: number = results[i]["bill_id"];
		bill_ids.push(bill_id);
	}
	for(var i = 0; i < bill_ids.length; i++){
		fetch('https://api.legiscan.com/?key=5c84b1d51093acc50f80c0cbcc51abd8&op=getBill&id=' + bill_ids[i])
		.then(response => response.json())
		.then(response => bill_titles.push(response["bill"]["title"]))

	}
	console.log("bill titiles " + bill_titles);
	return bill_titles;

}

function LegiScanAPI() {
	const [jsoner,setJsonData] = useState(null);
	const [query,setQuery] = useState("");

useEffect(() => {
  fetch('https://api.legiscan.com/?key=5c84b1d51093acc50f80c0cbcc51abd8&op=getSearchRaw&state=CA&query=' + query)
  .then(response => response.json())
  .then(data => setJsonData(JSON.stringify(getBills(data))))
  .catch(error => console.error(error));
},[query]);

return (
  <div className="App">
  <input placeholder="enter search query" onChange={event => setQuery(event.target.value)} />

    {query}
    {jsoner}
  </div>
);
}

export default LegiScanAPI
