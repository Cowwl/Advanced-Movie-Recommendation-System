import React from "react"; 
import Result from "./Result"; 

function Results({ results, openDetail }) { 
return ( 
	<section className="results"> 
	{typeof results != "undefined" ? ( 
		results.map((result) => ( 
		<Result key={result.imdbID} result 
			={result} openDetail={openDetail} /> 
		)) 
	) : ( 
		<div className="not-found"> 
		<h2>Sorry.. Movie not found in the database.</h2> 
		<h2> 
			Try checking the name you input 
			or search for another movie. 
		</h2> 
		</div> 
	)} 
	</section> 
); 
} 

export default Results; 
