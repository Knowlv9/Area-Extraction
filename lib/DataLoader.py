import os
import glob
import json
import numpy as np
import pandas as pd

class DataLoader(object):
	"""docstring for DataLoader."""

	def __init__(self, srcpath , datasetpath):
		super(DataLoader, self).__init__()
		self.srcpath = srcpath
		self.datasetpath = datasetpath
		self.pathdata = {}

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
			for dic in data.values():
				for i, li in dic.items():
					d = {"No": int(i), "class": 0, "check": 0, "loc": li}
					dfsets.append(d)
			df = pd.DataFrame(dfsets).set_index("No")

			df.to_csv(csvpath, encoding="utf-8")

			del df

		self.csvpath = csvpath
		self.act_df = pd.read_csv(csvpath, encoding="utf-8")
		self.act_df = self.act_df.set_index("No")
		data = self.act_df.to_dict("index")

		for idx, row in data.items():
			row["loc"] = row["loc"].replace("[[", '').replace("]]", '')
			row["loc"] = row["loc"].split("], [")
			for i, loc in enumerate(row["loc"]):
				row["loc"][i] = [int(i) for i in loc.split(",")]
			data[idx]["loc"] = row["loc"]

		result = {
			"origin_imgpath": path,
			"data": data
		}

		return result

	def update_class(self, idx, classify):
		classify = 0 if classify is None else int(classify)
		try:
			self.act_df.loc[idx, "class"] = classify
			self.act_df.to_csv(self.csvpath, encoding="utf-8")
			return True
		except Exception as e:
			print(e)
			return False
