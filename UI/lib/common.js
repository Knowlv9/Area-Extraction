async function setSelect(select) {
	let pathdata = {}
	const result =  await eel.classify()().then(data => {
		// console.log(data);
		for (var key in data) {
			const option = document.createElement("option");
			option.value = key;
			option.innerHTML = key;
			select.appendChild(option);
			pathdata[key] = {}
			for (var filename in data[key]) {
				pathdata[key][filename] = data[key][filename];
			}
		}
	});

	return pathdata;
}
