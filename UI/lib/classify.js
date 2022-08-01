let preX = 0, // 1つ前のX座標
	preY = 0, // 1つ前のY座標
	drawFlag = false;   // 線を描画中か
	line_log = [];

// const classifydata = {
// 	"0": "class_etc",
// 	"1": "class_sur",
// 	"2": "class_int",
// 	"3": "class_base",
// 	"4": "class_inf",
// 	"5": "class_sclu",
// 	"6": "class_clu",
// 	"7": "class_xcell",
// 	"8": "class_miss",
// 	"9": "class_anom"
// }
/*
	フォルダ選択
*/



/*
	分類ボタン選択
	prev・next
*/

/*
	init
*/
function drawLine(startX, startY, endX, endY) {
	console.log("drawLine");
	// コンテキストを取得
	const ctx = classify.canvas.getContext('2d');

	// 現在の描画状態を保存する
	ctx.save();

	ctx.lineCap = 'round';
	ctx.lineWidth = 3;
	ctx.strokeStyle = '#ff00ff';

	ctx.beginPath();                // 現在のパスをリセットする
	ctx.moveTo(startX, startY);     // パスの開始座標を指定する
	ctx.lineTo(endX, endY);         // 座標を指定してラインを引く
	ctx.stroke();                   // 現在のパスを描画する

	// 描画状態を保存した時点のものに戻す
	ctx.restore();
}

async function setSelect() {
	const pathdata =  await eel.classify()().then(data => {
		// console.log(data);
		for (var key in data) {
			const option = document.createElement("option");
			option.value = key;
			option.innerHTML = key;
			classify.selectdir.appendChild(option);
			classify.pathdata[key] = {}
			for (var filename in data[key]) {
				classify.pathdata[key][filename] = data[key][filename];
			}
		}
	});

	return ;
}

async function setCheckbox() {
	console.log("setCheckbox");
	classify.j_data = {}

	const wrap = document.getElementById("CheckboxWrap");
	const j_data = await eel.get_json()().then(res => {
		for (var key in Object.keys(res["classify"])) {
			classify.j_data[key] = res["classify"][key];

			const div = document.createElement("div");
			div.classList.add("form-check");

			const input = document.createElement("input");
			input.setAttribute("type", "checkbox");
			input.setAttribute("name", "classify");
			input.value = key;
			input.id = res["classify"][key]["id"];

			const label = document.createElement("label");
			label.classList.add("form-check-label");
			label.setAttribute("for", res["classify"][key]["id"]);
			label.innerHTML = `${key}.${res["classify"][key]["innerHTML"]}`;

			div.appendChild(input);
			div.appendChild(label);

			wrap.appendChild(div);
		}
		return res;
	});
	return ;
}

const select_dir = (dir) => {
	if (classify.selectdir.values == "None") {
		return ;
	}

	const select = document.getElementById("Filelist");
	select.innerHTML = '';

	const nullopt = document.createElement("option");
	nullopt.innerHTML = "- select image";
	nullopt.value = "None";

	select.appendChild(nullopt);
	// console.log(dir, classify.pathdata[dir]);
	for (var filename in classify.pathdata[dir]) {
		const path = classify.pathdata[dir][filename];

		const option = document.createElement("option");
		option.innerHTML = filename;
		option.value = path;

		select.appendChild(option);
	}

	return ;
}

const resize_loc = (arr) => {
	// return arr;
	if (arr.length <= 500) return arr;

	let a = 0;
	let i = 0;
	let idx_li = [];
	const li = {};
	while (a < arr.length) {
		if (idx_li.indexOf(parseInt(a)) == -1) {
			idx_li.push(parseInt(a));
			li[i] = arr[parseInt(a)];
			i += 1;
		}
		a += arr.length / 32;
	}

	return li;
}

const init_canvas = (idx) => {
	console.log("init canvas");

	let f = true;
	classify.result.then(data => {
		if (idx == Object.keys(data["data"]).length || idx == 0) {
			classify.nextbtn.disabled = false;
		}
		// canvasに画像を表示
		const ctx = classify.ctx;
		ctx.lineWidth = 3;
		ctx.strokeStyle = '#00ff00';

		const img = new Image();

		img.src = "./canvas.png";
		// console.log(classify.scale_f);
		img.onload = () => {
			if (classify.scale_f) {
				ctx.scale(0.5, 0.5);
				classify.scale_f = false;
			};
			ctx.drawImage(img, 0, 0, 1024, 1024);
			const li = resize_loc(data["data"][idx]["loc"]);
			// console.log(li);
			ctx.beginPath();     // 1.Pathで描画を開始する
			for (var i in li) {
				if (i < 1) continue;
				ctx.moveTo(li[i-1][0], li[i-1][1]); // 2.描画する位置を指定する
				ctx.lineTo(li[i][0], li[i][1]); // 3.指定座標まで線を引く
				ctx.stroke();
				// console.log(i, s_x, s_y, e_x, e_y);
			}
			ctx.moveTo(li[i][0], li[i][1]); // 2.描画する位置を指定する
			ctx.lineTo(li[0][0], li[0][1]); // 3.指定座標まで線を引く
			ctx.stroke();
		};
		// checked checkbox
		const checkboies = document.getElementsByName("classify");
		f = false;
		for (var el of checkboies) {
			const classname = classify.j_data[el.value]["class"];
			el.checked = (data["data"][classify.idx][classname]) ? true : false;
			if (el.checked) f = true;
			console.log(classname, data["data"][classify.idx][classname], el.checked);
		}
		console.log(data["data"][idx]);

		this.NoIdx.innerHTML = `No. ${idx+1} / ${Object.keys(data["data"]).length}`;
		// if (idx == Object.keys(data["data"]).length-1) {
		// 	// console.log("last");
		// 	classify.nextbtn.disabled = true;
		// }
	});
	if (f == false) return ;
	classify.ctx.save();


}

async function js_get_data(val, dir) {
	console.log("js get_data");
	const result = await eel.get_data(val, dir)().then( data => {
		// console.log(data);
		return data;
	});
	return result;
}

async function save_result(idx, data) {
	return await eel.update_class(idx, data)().then( res => {
		return res;
	});
}

const update_class = () => {
	console.log("update");
	const classifyels = document.getElementsByName("classify");
	classify.result.then(data => {
		for (var el of classifyels) {
			data["data"][classify.idx][classify.j_data[el.value]["class"]] = (el.checked) ? 1 : 0;

			el.checked = (el.value == 0) ? true : false;
			console.log(el.value, el.checked);
		}

		console.log(data["data"][classify.idx]);
		// data["data"][classify.idx]["class"] = parseInt(classify);

		const f = save_result(classify.idx, data["data"][classify.idx]);

		f.then(res => {
			if (res) {
				classify.idx += 1;
				init_canvas(classify.idx);
			}
		})
	})

}

class Classify {
	constructor() {
		this.selectdir = document.getElementById("Directory");
		this.selectfile = document.getElementById("Filelist");
		this.showbtn = document.getElementById("ShowBtn");
		this.canvas = document.getElementById("Canvas");
		// this.clsIn = document.getElementById("ClassifyInput");
		this.prevbtn = document.getElementById("PrevBtn");
		this.newbtn = document.getElementById("NewBtn");
		this.nextbtn = document.getElementById("NextBtn");
		this.NoIdx = document.getElementById("NoIdx");
		this.checkbox = document.getElementsByName("classify");
		this.values = {}
		this.pathdata = {}
		this.result = '';
		this.ctx = this.canvas.getContext("2d");
		this.idx = -1;
		this.scale_f = true;
	}

	setElement(){
		// this.clsIn.onkeypress = (e) => {
		// 	const key = e.keyCode || e.charCode || 0;
		// 	if (key == 13) {
		// 		e.preventDefault();
		// 		update_class();
		// 	}
		// }
	}

	setEvent(){
		// select folder
		setSelect();
		setCheckbox();

		this.showbtn.onclick = () => {
			const dir = this.selectdir.value;
			const val = this.selectfile.value;
			this.values["dir"] = dir;
			this.values["imgfile"] = val;
			if (val == "None") return ;
			console.log("show btn");
			this.result = js_get_data(val, dir);
			this.idx = 0;
			init_canvas(this.idx);
		}
		this.nextbtn.onclick = () => {
			update_class();
		}

		this.newbtn.onclick = () => {
			this.result = this.result.then(data => {

				const last_idx = Object.keys(data["data"]).length;

				const classifyels = document.getElementsByName("classify");
				let class_idx = 0;
				for (var el of classifyels) {
					if (el.checked == true) class_idx = parseInt(el.value);
				}
				data["data"][last_idx] = {
					"check": 1,
					// "class": classify,
					"anno": 1,
					"loc": line_log
				}

				for (var el of classifyels) {
					// console.log(el.value, this.j_data);
					data["data"][last_idx][this.j_data[el.value]["class"]] = (el.checked) ? 1 : 0;
					el.checked = false;
				}
				console.log(data["data"][last_idx]);

				eel.add_df(last_idx, data["data"][last_idx])().then(res => {return ;});
				line_log = [];
				this.NoIdx.innerHTML = `No. ${this.idx+1} / ${Object.keys(data["data"]).length	}`;
				classify.nextbtn.disabled = false;
				return data;
			})
		}

		this.prevbtn.onclick = () => {
			this.idx -= 1;
			this.nextbtn.disabled = false;
			init_canvas(this.idx);
		}

		this.canvas.addEventListener('mousedown', (e)=> {
			// this.canvas.addEventListener('mousemove',move);
			// canvasの左上隅を原点とする座標を求める
			const downX = e.offsetX*2,
			downY = e.offsetY*2;

			 drawFlag = true;

			// 座標を保持する
			preX = downX;
			preY = downY;

			const classifyels = document.getElementsByName("classify");
			for (var el of classifyels) {
				el.checked = false;
			}
		});

		this.canvas.addEventListener('mouseup',(e)=> {
			drawFlag = false;
		});

		this.canvas.addEventListener('mouseout',(e)=> {
			drawFlag = false;
		});

		this.canvas.addEventListener('mousemove',(e)=> {
			if(!drawFlag) return ; // 描画中でない

			// canvasの左上隅を原点とする座標を求める
			const downX = e.offsetX*2,
				downY = e.offsetY*2;

			line_log.push([downX, downY]);

			// 1つ前の座標から現在の座標まで線分を描画する
			drawLine(preX, preY, downX, downY);

			// 座標を保持する
			preX = downX;
			preY = downY;
		});
	}
}

const classify = new Classify();
classify.setElement();
classify.setEvent();

// setTimeout(() => {
// 	let el = document.getElementById("Directory");
// 	el.options[3].selected = true;
// 	select_dir(el.value);
// 	let img = classify.selectfile.options[2];
// 	img.selected = true;
// 	classify.result = js_get_data(img.value, el.options[3].value);
// 	classify.idx = 0;
// 	init_canvas(classify.idx);
// 	setTimeout(() => {
// 		window.close()
// 	}, 1000);
// }, 1000);
