let preX = 0, // 1つ前のX座標
	preY = 0, // 1つ前のY座標
	drawFlag = false;   // 線を描画中か

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
async function setSelect() {
	const pathdata = await eel.home()().then(data => {
		// console.log(data);
		for (var key in data) {
			const option = document.createElement("option");
			option.value = key;
			option.innerHTML = key;
			home.selectdir.appendChild(option);

			home.pathdata[key] = {}
			for (var filename in data[key]) {
				home.pathdata[key][filename] = data[key][filename];
			}
		}
	});

	return ;
}

const select_dir = (dir) => {
	if (home.selectdir.values == "None") {
		return ;
	}
	const select = document.getElementById("Filelist");
	select.innerHTML = '';

	const nullopt = document.createElement("option");
	nullopt.innerHTML = "- select image";
	nullopt.value = "None";

	select.appendChild(nullopt);

	for (var filename in home.pathdata[dir]) {
		const path = home.pathdata[dir][filename];

		const option = document.createElement("option");
		option.innerHTML = filename;
		option.value = path;

		select.appendChild(option);
	}

	return ;
}

const resize_loc = (arr) => {
	if (arr.length <= 32) return arr;

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
	home.clsIn.value = '';
	home.nextbtn.disabled = false;


	home.result.then(data => {
		// canvasに画像を表示
		const ctx = home.ctx;
		ctx.lineWidth = 3;
		ctx.strokeStyle = '#00ff00';

		const img = new Image();

		img.src = "./canvas.png";
		// console.log(data["data"][idx]);
		// console.log(home.scale_f);
		img.onload = () => {
			if (home.scale_f) {
				ctx.scale(0.5, 0.5);
				home.scale_f = false;
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

		// checked radio
		const radio = document.getElementsByName("classify");
		for (var el of radio) {
			if (el.value == data["data"][idx]["class"] && el.value > 0){
				el.checked = true;
				break;
			}
		}

		this.NoIdx.innerHTML = `No. ${idx} / ${Object.keys(data["data"]).length-1}`;
		if (idx == Object.keys(data["data"]).length-1) {
			console.log("last");
			home.nextbtn.disabled = true;
		}
	});
	home.ctx.save();
	home.clsIn.focus();


}

async function js_get_data(val, dir) {
	return await eel.get_data(val, dir)().then( data => {
		return data;
	});
}

async function save_result(idx, checked) {
	return await eel.update_class(idx, checked)().then( res => {
		return res;
	});
}

const update_class = () => {
	const classifyels = document.getElementsByName("classify");
	let classify = null;
	for (var el of classifyels) {
		if (el.checked == true) {
			classify = el.value
			el.checked = false;
		};
	}

	// console.log(this.idx, checked);
	home.result.then(data => {
		data["data"][home.idx]["class"] = parseInt(classify);

		const f = save_result(home.idx, classify);

		f.then(res => {
			if (res) {
				home.idx += 1;


				init_canvas(home.idx);
			}
		})

	})

}

class Home {
	constructor() {
		this.selectdir = document.getElementById("Directory");
		this.selectfile = document.getElementById("Filelist");
		this.showbtn = document.getElementById("ShowBtn");
		this.canvas = document.getElementById("Canvas");
		this.nextbtn = document.getElementById("NextBtn");
		this.clsIn = document.getElementById("ClassifyInput");
		this.NoIdx = document.getElementById("NoIdx");
		this.values = {}
		this.pathdata = {}
		this.result = '';
		this.ctx = this.canvas.getContext("2d");
		this.idx = -1;
		this.scale_f = true;
	}

	setElement(){
		this.clsIn.onkeypress = (e) => {
			const key = e.keyCode || e.charCode || 0;
			if (key == 13) {
				e.preventDefault();
				update_class();
			}
		}
	}

	setEvent(){
		// select folder
		setSelect();

		this.showbtn.onclick = () => {
			const dir = this.selectdir.value;
			const val = this.selectfile.value;
			this.values["dir"] = dir;
			this.values["imgfile"] = val;
			if (val == "None") return ;

			this.result = js_get_data(val, dir);
			this.idx = 0;
			init_canvas(this.idx);
		}
		this.nextbtn.onclick = () => {
			update_class();
		}
		document.getElementById("PrevBtn").onclick = () => {
			this.idx -= 1;
			init_canvas(this.idx);
		}

		// this.canvas.addEventListener('mousedown', (e)=> {
		// 	// this.canvas.addEventListener('mousemove',move);
		// 	// canvasの左上隅を原点とする座標を求める
		// 	const downX = e.offsetX*2,
		// 	downY = e.offsetY*2;
		//
		// 	// 座標を保持する
		// 	preX = downX;
		// 	preY = downY;
		// });
		//
		// this.canvas.addEventListener('mouseup',(e)=> {
		// 	// this.canvas.removeEventListener('mousemove',move);
		// 	// マウスボタンが離されたので、描画フラグをfalseにする
		// 	const downX = e.offsetX*2,
		// 		downY = e.offsetY*2;
		//
		// 	console.log(preX, preY, downX, downY);
		// });

		// this.canvas.addEventListener('mousemove',(e)=> {
		// 	if(!drawFlag) {// 描画中でない
		// 		return;
		// 	}
		// 	// canvasの左上隅を原点とする座標を求める
		// 	const downX = e.offsetX,
		// 		downY = e.offsetY;
		//
		// 	// 1つ前の座標から現在の座標まで線分を描画する
		// 	// drawLine(preX, preY, downX, downY);
		//
		// 	// 座標を保持する
		// 	preX = downX;
		// 	preY = downY;
		// });
	}
}

const home = new Home();
home.setElement();
home.setEvent();

// setTimeout(() => {
// 	let el = document.getElementById("Directory");
// 	el.options[3].selected = true;
// 	select_dir(el.value);
// 	let img = home.selectfile.options[10];
// 	img.selected = true;
// 	home.result = js_get_data(img.value, el.options[3].value);
// 	home.idx = 0;
// 	init_canvas(home.idx);
// 	// setTimeout(() => {
// 	// 	window.close()
// 	// }, 10000);
// }, 1000);
