# Area-Extraction in Cytology Image
-----------------------------------
 *Area-Extract* is a drawing annotation for preparing train dataset.
 
# DEMO
-----------------------------------


https://user-images.githubusercontent.com/80980441/182575158-90d20bf3-eac9-4881-bbc4-976fa1b84ef0.mp4


 
# Requirement
-----------------------------------

```
Area-Extract
    ├─ SOURCE
    │  ├─wsi_1
    │  │  ├─ aaa.png
    │  │  ├─ bbb.png
    │  │  ⁝
    │  │  └─ xxx.png
    │  ⁝
    │  └─ ...
    ├─datasets
    │  ├─wsi_1
    │  │  ├─wsi_1
    │  │  │   ├─ aaa.jpeg
    │  │  │   ├─ bbb.jpeg
    │  │  │   ︙
    │  │  │	  └─ xxx.jpeg
    │  │  │
    │  │  ├─dfsets
    │  │  │    ├─ aaa.csv
    │  │  │    ├─ bbb.csv
    │  │  │    ︙
    │  │  │    └─ xxx.csv
    │  │  │
    │  │  └─locs
    │  │     ├─ aaa.json
    │  │     ├─ bbb.json
    │  │     ︙
    │  │     └─ xxx.json
    │  ︙
    │  └─ ...
    ├─── UI
    │    │  ├─wsi_1
    │    │  │    ├─ aaa.png
    │    │  │    ├─ bbb.png
    │    │  │    ├─ ccc.png
    │    │  │     ⁝
    │    │  │    └─ zzz.png
    │    ⁝   ⁝ 
    │    │  └─ ...
    │    ├─ lib
    │    │    ├─ classify.js
    │    │    ├─ common.js
    │    │    └─ dashboard.js
    │    ├── styles
    │    │     ├─ classify.css
    │    │     ├─ common.css
    │    │     └─ dashboard.css
    │    ├─ canvas.png
    │    ├─ classify.html
    │    ├─ dashboard.html
    │    ├─ display.html
    │    ├─ favicon.ico
    │    └─ LC20_1024
    ├─lib
    │  ├─ ( archives.py )
    │  └─ DataLoader.py
    ├─conf
    │  ├─ conf.ini
    │  └─ setting.json
    ├─ detect_cell.py
    └─ main.py
```
###  requisites:
-------------------------------
* eel  0.14.0
* pandas 1.4.2
* numpy 1.21.5
 
# Usage
 -----------------------------------

In general, when annotating pathology images, it is necessary to display images larger than 2 GB. In particular, cytology images do not need to be displayed in WSI because they are annotated with a size of about 100px. Therefore, we made it possible to draw from images cropped at 1024 x 1024 as needed. In addition, to allow labeling according to study use, settings can be made in conf/setting.json.

### 1. Region extraction by filter processing
--------------------------------------
To make the annotation process a little less time-consuming, we will first annotate the cells by filtering.<br>

Do the following:

```
python detect_cell.py [OPTIOIN] SAVEDIR [one or multi] PATH
```

The arguments are as follows:
```
    one PTAH: image file path
    muti PATH: directory
    [OPTION]
    --shrap_kernel_size (1): Sharpening filter kernel size
    --mor_kernel_size (5): Kernel size of morphological transformation
    --thrshold (230): Threshold for binarization
    --area_thrshold (1200): Extracted area threshold
    --figsize (10): Save file size
```
### 2. Setting
--------------------------------------

#### 2-1. conf.ini
-------------------------------------

Please set up $ conf/conf.ini $. The following items are required.

```
[DEFAULT]
GUI_WIDTH = 1000
GUI_HEIGHT = 800
SOURCE = SOURCEDIR
DATASETS = DATASETSDIR
```

#### 2-2 setting.json
-------------------------------------
In setting.json, set the annotation labels.

```
{
    "classify": {
        "0": {
			"id": "ClassifyEtc",
			"innerHTML": "ignore",
			"class": "class_etc"
		},
        "1": {
            "id": "",
            "innerHTML": "",
            "class": "class_xxx" 
        },
        ...
    }
}
```

Note that class values must be prefixed with "class_". Also, the GUI is designed with the assumption that "0" is treated as an unlearned item afterwards.

### 3. GUI
--------------------------------------

```
python main.py
```

#### 3-1. dashboard.html
---------------------------------------
On startup, you will see a dashboard; select the list of DATASETS(SAVEDIR) directory configurations created in detect_cell.py. As a result, you can see which images have what kind of labels and how many of them you have annotated yourself.

#### 3-2. classify.html
---------------------------------------
Select the image to be annotated from the selection screen. After that, you can label the area circled in yellow-green. You can select multiple labeling options, and if you press "next" afterwards, which is not appropriate for training data, the image will be labeled "0". If you feel that you have annotated the image yourself, you can draw it by pressing the cursor on the image. When you have finished drawing, check the label and select "new". If you make a mistake, press "next" or "prev" to initialize the label.


# Note
 -----------------------------------

As a future plan, we would like to be able to fill in the annotated area to perform rle processing or create train images.
 
# Author
 -----------------------------------
 
* Author: Sakaguchi
 
# License
-----------------------------------

"Area-ExtractApp" is under [MIT license](https://en.wikipedia.org/wiki/MIT_License).
