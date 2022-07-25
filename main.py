import os, sys
import eel
import configparser
import shutil

from lib.archives import *
from lib.DataLoader import DataLoader

conf_default = configparser.ConfigParser()
conf_default.read("./conf/conf.ini", encoding="utf-8")
conf = conf_default["DEFAULT"]

dataloader = DataLoader(conf["SOURCE"], conf["DATASETS"])

@eel.expose
def home():
	print("home")
	directories = dataloader.get_dirs()
	return directories

@eel.expose
def get_data(path, d):
	data = dataloader.get_data(path, d)
	src = data["origin_imgpath"]
	shutil.copyfile(src, "./UI/canvas.png")
	return data

@eel.expose
def update_class(idx, classify):
	return dataloader.update_class(idx, classify)

def onCloseWindow(page, sockets):
	print("close App")
	sys.exit()

def main():

	eel.init("UI")
	# eel.echo("hello world!")
	eel.start(
		"classify.html",
		size=(int(conf["GUI_WIDTH"]), int(conf["GUI_HEIGHT"])),
		# close_callback=onCloseWindow
	)

if __name__ == "__main__":
	main()
