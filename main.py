import os, sys, json
import eel
import configparser
import shutil

from lib.archives import *
from lib.DataLoader import DataLoader

conf_default = configparser.ConfigParser()
conf_default.read("./conf/conf.ini", encoding="utf-8")
conf = conf_default["DEFAULT"]

info = {}
with open("./conf/setting.json", 'r', encoding="utf-8") as f:
	info = json.load(f)
f.close()

dataloader = DataLoader(conf["SOURCE"], conf["DATASETS"], info)

'''
	dashboard
'''
@eel.expose
def get_progress(d):
	result = dataloader.get_progress(str(d))
	# print(result)
	return result

'''
	classify
'''
@eel.expose
def classify():
	# print("home")
	# print(info)
	dataloader = DataLoader(conf["SOURCE"], conf["DATASETS"], info)
	directories = dataloader.get_dirs()
	return directories

@eel.expose
def get_json():
	info = {}
	with open("./conf/setting.json", 'r', encoding="utf-8") as f:
		info = json.load(f)
	f.close()
	return info

@eel.expose
def get_data(path, d):
	data = dataloader.get_data(path, d)
	src = data["origin_imgpath"]
	shutil.copyfile(src, "./UI/canvas.png")
	return data

@eel.expose
def update_class(idx, data):
	return dataloader.update_class(idx, data)

@eel.expose
def add_df(idx, dic):
	dataloader.add_new(idx, dic)
	return None
'''
	Display
'''
@eel.expose
def display():
	return dataloader.display()

def onCloseWindow(page, sockets):
	print("close App")
	sys.exit()

def main():

	eel.init("UI")
	# eel.echo("hello world!")
	eel.start(
		# "classify.html",
		"dashboard.html",
		size=(int(conf["GUI_WIDTH"]), int(conf["GUI_HEIGHT"])),
		# close_callback=onCloseWindow
	)

if __name__ == "__main__":
	main()
	# path = "./LC20_1024/1002173/1002173_10072_33600_1024.png"
	# d = "1002173"
	# data = get_data(path, d)
