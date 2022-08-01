import os, sys
import glob
import json
import pprint
import numpy as np
import pandas as pd

class DataLoader(object):
	"""docstring for DataLoader."""

	def __init__(self, srcpath , datasetpath, info):
		super(DataLoader, self).__init__()
		self.srcpath = srcpath
		self.datasetpath = datasetpath
		self.pathdata = {}
		self.info = info

	def get_dirs(self):
		dirlist = os.listdir(self.srcpath)

		for d in dirlist:
			png_path = f"{self.srcpath}/{d}/**/*.png"
			files = glob.glob(png_path, recursive=True)

			self.pathdata[d] = {}
			for f in [f.replace('\\', '/') for f in files]:
				filename = os.path.basename(f)
				self.pathdata[d][filename] = f

		return self.pathdata

	def get_data(self, path, d):
		print(path, d)
		jsonfile = os.path.basename(path).replace('.png', '.json')
		jsonpath = f"{self.datasetpath}/{d}/locs/{jsonfile}"

		csvfile = os.path.basename(path).replace('.png', '.csv')
		os.makedirs(f"{self.datasetpath}/{d}/dfsets", exist_ok=True)
		csvpath = f"{self.datasetpath}/{d}/dfsets/{csvfile}"

		if os.path.exists(csvpath) is False:
			print("load json")
			with open(jsonpath, 'r', encoding="utf-8") as f:
				data = json.load(f)
			f.close()

			dfsets = []
			dic = data.values()
			# print(dic)
			for dic in data.values():
				data_idx = [int(i) for i in dic.keys()]
				i = 0
				while i < max(data_idx):
					li = dic[str(i)]
					d = {
					"No": int(i),
					"check": 0,
					"anno": 0
					}
					for idx, row in self.info["classify"].items():
						d[row["class"]] = 0
					d["loc"] = str(li).replace(",", '').replace('\n', '')
					dfsets.append(d)
					i += 1
			df = pd.DataFrame(dfsets).set_index("No")
			df.to_csv(csvpath, encoding="utf-8", index=True)

			del df

		self.csvpath = csvpath
		self.act_df = pd.read_csv(csvpath, encoding="utf-8")
		self.act_df = self.act_df.set_index("No")

		for idx, row in self.info["classify"].items():
			if row["class"] not in self.act_df.columns:
				self.act_df[row["class"]] = 0

		data = self.act_df.to_dict("index")

		for idx, row in data.items():
			row["loc"] = row["loc"].replace("[[", '').replace("]]", '')
			row["loc"] = row["loc"].split("] [")
			for i, loc in enumerate(row["loc"]):
				row["loc"][i] = [int(i) for i in loc.split(" ")]
			data[idx]["loc"] = row["loc"]

		result = {
			"origin_imgpath": path,
			"data": data
		}
		# print(data)
		return result

	def update_class(self, idx, data):
		print(idx, ": update class")
		try:
			f = True
			for k, v in data.items():
				self.act_df.loc[idx, k] = str(v)
				# print(k, "class" in k, v, v != 0, "class" in k and v != 0)
				if "class" in k and v != 0:
					# print(self.act_df.loc[idx, "class_etc"])
					f = False
			self.act_df.loc[idx, "loc"] = str(self.act_df.loc[idx, "loc"]).replace(',', '')
			self.act_df.loc[idx, "check"] = 1
			if f:
				self.act_df.loc[idx, "class_etc"] = 1
			print(self.act_df.loc[idx])
			self.act_df.to_csv(self.csvpath, encoding="utf-8")
			return True
		except Exception as e:
			print(e)
			return False
		return False

	def add_new(self, idx, dic):
		print("new annotation:", idx)
		dic["loc"] = str(dic["loc"]).replace(",", '')
		self.act_df.loc[idx] = dic
		self.act_df.loc[idx, "anno"] = 1
		return None

	'''
		Display
	'''
	def get_progress(self, d):
		data = {}

		img_paths = f"{self.srcpath}/{d}/**/*.png"
		img_list = glob.glob(img_paths, recursive=True)

		for img_path in img_list:
			filename = os.path.basename(img_path)
			df_path = "%s/%s/dfsets/%s.csv" % (self.datasetpath, d, os.path.splitext(filename)[0])
			# exist csv file
			f = os.path.exists(df_path)
			# read csv

			if f:
				df = pd.read_csv(df_path)
				anno = int(df[df["anno"] == 1]["anno"].sum()) if "anno" in df.columns else 0
				check_len = int(df[df["check"] == 1]["check"].sum())
				data[filename] = {
					"len": len(df),
					"checked": check_len,
					"annotation": anno
				}
				class_cols = [c for c in df.columns if "class" in c]
				for cls in class_cols:
					data[filename][cls] = int(df[df[cls] == 1][cls].sum())
				del df
			else:
				data[filename] = {
					"len": 0,
					"checked": 0,
					"annotation": 0
				}
				class_cols = [cls["class"] for idx, cls in self.info["classify"].items()]
				for cls in class_cols:
					data[filename][cls] = 0




		return data
