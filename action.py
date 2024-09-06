import tkinter as tk
from tkinter import Label
import pyautogui
import pyperclip
from PIL import ImageGrab

def get_color(x,y):
    img = ImageGrab.grab(x,y,x+1,y+1)
    color = img.getpixel((0,0))
    return color

def onclick(event):
    x,y= event.x_root, event.y_root
    color=get_color(x,y) #returns rgb (0,1,2)
    hex="#{}{}{}".format(color[0],color[1],color[2])
    print(hex)
    pyperclip.copy(hex)
    

