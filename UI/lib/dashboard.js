
const set_thead = (filename, row) => {
	const thead = dashboard.thead;
	thead.innerHTML = '';
	const th_tr = document.createElement("tr");

	let th_row = ["index", "progress", "len"];
	for (var key in row) if (key.indexOf("class") > -1) th_row.push(key);
	console.log(th_row);
	for (var key in dashboard.setting) {
		if (th_row.indexOf(key) == -1 ) {
			th_row.push(key);
		}
		// console.log(key, th_row.indexOf(key));
	}

	for (var key of th_row) {
		const th = document.createElement("th");
		th.classList.add("small");
		th.classList.add("font-small");
		th.classList.add("text-center");

		th.innerHTML = (key.indexOf("class") > -1) ? dashboard.setting[key] : key;

		thead.appendChild(th);
	}
	return th_row;
}

const set_tbody = (filename, keys, row) => {
	const tr = document.createElement("tr");

	for (var k of keys) {
		const td = document.createElement("td");
		td.classList.add("text-center")
		if (k == "index") {
			// get filename
			td.classList.add("small");
			filename = filename.replace(".png", '');
			filename = filename.replace(String(dashboard.d)+'_', '');
			td.innerHTML = filename;
		}else if (k == "progress") {
			// get progress ratio
			const val = new Intl.NumberFormat('ja', {
				style: 'percent',
				maximumSignificantDigits: 3
			}).format((row["len"] > 0) ? row["checked"]/row["len"] : 0);
			td.innerHTML = val;
		}else{
			// get classify
			row[k] = (row[k] != undefined) ? row[k] : 0;
			td.innerHTML = row[k]
		}
		tr.appendChild(td);
	}
	return tr;
}

async function get_dir(val, thead, tbody) {
	dashboard.d = val;
	tbody.innerHTML = '';
	let i = 0;
	await eel.get_progress(val)().then(result => {
		const ini = Object.keys(result)[0];
		const th_keys = set_thead(ini, result[ini]);

		for (var filename in result) {
			const td = set_tbody(filename, th_keys, result[filename]);

			tbody.appendChild(td);
			i += 1;
		}
	})
}

class Dashboard {
	constructor() {
		this.selectdir = document.getElementById("Directory");
		this.d = '';
		this.thead = document.getElementById("Thead");
		this.tbody = document.getElementById("Tbody");
	}

	setElement(){
		this.setting = {}
		const setting = eel.get_json()().then(data => {
			for (var idx in data["classify"]) {
				this.setting[data["classify"][idx]["class"]] = data["classify"][idx]["innerHTML"];
			}
		})
		setSelect(this.selectdir);
	}

	setEvent(){

	}
}

const dashboard = new Dashboard();
dashboard.setElement();
dashboard.setEvent();

// setTimeout(() => {
// 	let el = document.getElementById("Directory");
// 	el.options[3].selected = true;
// 	get_dir(el.value, dashboard.thead, dashboard.tbody);
// 	// setTimeout(() => {
// 	// 	window.close()
// 	// }, 1000);
// }, 1000);
