import os, sys
import matplotlib.pyplot as plt
import numpy as np
import cv2
import click
import glob
import re
from pathlib import Path
import json

def make_sharp_kernel(k: int):
	return np.array([
		[-k / 9, -k / 9, -k / 9],
		[-k / 9, 1 + 8 * k / 9, k / 9],
		[-k / 9, -k / 9, -k / 9]
		], np.float32)

def detect_cells(path, arg):
	# 画像の読込
	ori = cv2.imread(path)
	# BGR => RGB
	img = cv2.cvtColor(ori, cv2.COLOR_BGR2RGB)
	# BGR => GRAY
	gray = cv2.cvtColor(ori, cv2.COLOR_BGR2GRAY)
	# GRAY + sharp
	sharp_kernel = make_sharp_kernel(arg["shrap_size"])
	sharp_gray = cv2.filter2D(gray, -1, sharp_kernel).astype("uint8")
	shrp_gry_ret, shrp_gry_thr = cv2.threshold(
		sharp_gray, arg["threshold"], 255, cv2.THRESH_BINARY_INV
	)
	# モルフォロジー変換
	kernel_mor = np.ones((arg["mor_size"], arg["mor_size"]),np.uint8)

	# gray + blur + thresh + close
	shrp_gry_thr_close = cv2.morphologyEx(shrp_gry_thr, cv2.MORPH_CLOSE, kernel_mor)

	# gray + blur + thresh + close + open
	shrp_gry_thr_close_open = cv2.morphologyEx(shrp_gry_thr_close, cv2.MORPH_OPEN, kernel_mor)
	# plt.imshow(shrp_gry_thr_close_open, cmap="gray")
	# plt.show()
	# plt.close()

	#輪郭検出 （cv2.ChAIN_APPROX_SIMPLE）
	contours1, hierarchy1 = cv2.findContours(shrp_gry_thr_close_open, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

	cnt_li = []
	arclen_li = []
	for i, cnt in enumerate(contours1):
		area = cv2.contourArea(cnt)
		arclen = cv2.arcLength(cnt, True)
		if area > arg["area_thrshold"]:
			# print(f"contour: {i}, area: {area}")
			cnt_li.append(cnt)
			arclen_li.append(arclen)

	draw = cv2.drawContours(
		cv2.cvtColor(ori, cv2.COLOR_BGR2RGB),
		cnt_li, -1, (0, 255, 0), 1, cv2.LINE_AA
	)
	return draw, cnt_li

@click.group()
@click.argument("savedir", type=str, default="./detect_cell_results/")
@click.option("--shrap_kernel_size", '-sk', default=1, type=int)
@click.option("--mor_kernel_size", '-mk', default=5, type=int)
@click.option("--threshold", '-thr', type=int, default=230)
@click.option("--area_thrshold", "-athr", type=int, default=1200)
@click.option("--figsize", type=int, default=10)
@click.pass_context
def main(arg, **kwargs):
	savedir = kwargs["savedir"]
	os.makedirs(savedir, exist_ok=True)
	arg.obj = {
		"shrap_size": kwargs["shrap_kernel_size"],
		"mor_size": kwargs["mor_kernel_size"],
		"threshold": kwargs["threshold"],
		"savedir": savedir,
		"area_thrshold": kwargs["area_thrshold"],
		"figsize": kwargs["figsize"],
		"dataloc": "%s/dataloc.json" % savedir
	}
	# print(arg.obj)
	pass
# python detect_cell.py -thr 254 -athr 2500 savedir multi /Users/jsakaguc/workspace/AI_pathology/LC20_1024/1002173
@main.command()
@click.argument("path", type=str)
@click.pass_obj
def one(arg, path):
	click.echo(click.style("one image",bold=True, underline=True, reverse=True))
	# print(arg)

	draw, li = detect_cells(path, arg)

	loc_li = []
	for l in li:
		for i in l:
			loc_li.append(i[0].tolist())
	loc = {}
	loc[os.path.basename(path)] = loc_li
	with open(arg["dataloc"], 'w', encoding="utf-8") as f:
		json.dump(loc, f, ensure_ascii=False, indent=4)
	sys.exit()

	filename =	os.path.splitext(os.path.basename(path))[0]
	savepath = f"{arg['savedir']}/{filename}_detect.jpeg"
	fig = plt.figure(figsize=(arg["figsize"], arg["figsize"]))
	plt.imshow(draw)
	plt.title(filename)
	plt.axis("off")
	plt.savefig(savepath)
	print("save path:", savepath)

@main.command()
@click.argument("dir", type=str)
@click.pass_obj
def multi(arg, dir):
	click.echo(click.style("multiple images", fg="blue"))
	d = dir.split('/')[-1]

	root = Path(dir)
	files = sorted([p for p in root.glob('**/*') if re.search('/*\.(jpg|jpeg|png|gif|bmp)', str(p))])

	for i, file in enumerate(files):
		file = str(file).replace("\\", '/')
		if "all" in file: continue
		# print(arg["dataloc"].replace("dataloc", f"{i}_dataloc"))
		# break
		loc = {}

		savedir = f"{arg['savedir']}/{d}/{file.split('/')[-2]}"
		os.makedirs(savedir, exist_ok=True)

		draw, locs_li = detect_cells(file, arg)
		# draw = detect_cells(file, arg["threshold"], arg["shrap_size"], arg["mor_size"])

		loc_li = []
		loc[os.path.basename(file)] = {}
		for j, li in enumerate(locs_li):
			hoge = []
			for l in li:
				hoge.append(l[0].tolist())
			loc[os.path.basename(file)][j] = hoge

		# loc["source_path"] = root
		# sys.exit()
		locdir = f"{arg['dataloc'].replace('/dataloc.json', '')}/{file.split('/')[-2]}/locs"
		os.makedirs(locdir, exist_ok=True)
		# sys.exit()
		filename =	os.path.splitext(os.path.basename(file))[0]
		with open(f"{locdir}/{filename}.json", 'w', encoding="utf-8") as f:
			json.dump(loc, f, ensure_ascii=False, indent=4)
		f.close()

		savepath = f"{savedir}/{filename}_detect.jpeg"
		fig = plt.figure(figsize=(arg["figsize"], arg["figsize"]))
		plt.imshow(draw)
		plt.title(filename)
		plt.axis("off")
		plt.savefig(savepath)
		# plt.show()
		plt.close()
		print(f"{i+1}/{len(files)}\t save path:", savepath)
		# break
		# if i == 1: break


if __name__ == "__main__":
	main()
