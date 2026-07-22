---
title: Pygame学习笔记(3)
date: 2024-11-17
tags:
  - 算法
---

## 让角色使用道具

在输入控制方法中添加一个空格键监测，让我们在按下空格键的时候可以播放玩家使用工具的动画。

```
if keys[pygame.K_SPACE]:
    self.tool_use = True
    self.tool = axe
```

在我们的状态获取方法中将状态更改为对应的使用工具的状态

```
if self.tool_use:
    self.status = self.status.split('_')[0] + '_' + self.tool
```

这样在我们按下空格键的时候就可以播放使用斧头的动画了（脑补动画）

但是现在我们会一直挥动斧头不会停止，所以我们需要添加一个计时器来控制使用工具时的动画播放时间。让我们新建一个timer.py文件，写一个简单的计时器。

```
import pygame

class Timer:
    def __init__(self,duration,func = None):
        self.duration = duration
        self.func = func
        self.start_time = 0
        self.active = False

    def activate(self):
        self.active = True
        self.start_time = pygame.time.get_ticks()

    def deactivate(self):
        self.active = False
        self.start_time = 0

    def update(self):
        current_time = pygame.time.get_ticks()
        if current_time - self.start_time >= self.duration:
            self.deactivate()
            if self.func:
                self.func()
```

在这里我们创建了一个计时器类，它接收时间和一个方法，可以在记时结束的时候进行这个方法的调用。在activate方法中，我们对计时器进行激活，并记录下激活时的时间，在deactivate方法中我们将计时器关闭并重置开始的时间，在update函数中我们记录每次调用此方法时的时间，如果现在的时间减去开始的时间大于等于我们传入的时间预设值的时候，我们将计时器关闭，并执行传入的方法。

回到player文件中，我们创建一个计时器的字典用来储存我们即将创建的计时器实例。

```
self.timers = {
            'tool use': Timer(350,self.use_tool),
        }
```

这里有个use\_tool方法传入，我们暂且先创建一个空方法在player中为后续做准备，现在我们可以暂且不用管它。现在回到我们的input方法中，对按键的监测进行一些更改。

```
if keys[pygame.K_SPACE]:
    self.timers['tool use'].activate()
    self.direction = pygame.math.Vector2()
    self.frame_index = 0
```

当我们按下空格键的时候我们启动计时器，并将玩家的运动向量重置为零，以防止玩家边跑边使用工具，同时我们将图片的引索值归为零以确保我们的动画从头开时播放。

```
def update_timers(self):
        for timer in self.timers.values():
            timer.update()
def update(self, dt):
        self.input()
        self.get_status()
        self.update_timers()
        self.move(dt)
        self.animate(dt)
```

接下来我们定义一个计时器的刷新方法来在player中时刻更新计时器，同时在update方法中调用此刷新。

```
    def get_status(self):
        if self.direction.magnitude() == 0:
            self.status = self.status.split('_')[0] + "_idle"
        if self.timers['tool use'].active:
            self.status = self.status.split('_')[0] + '_axe'
```

在状态获取方法中我们对计时器的激活状态进行监测，如果处于激活状态我们就将状态改为使用工具的状态，这样我们就可以正常使用工具。（动画脑补）

## 工具的切换

在素材中我们准备了三种工具，所以我们接下来要能够实现让玩家可以自主地切换使用工具。

```
        self.tools = ['hoe','axe','water']
        self.tool_index = 0
        self.select_tool = self.tools[self.tool_index]
```

回到player的初始化器中，我们添加一个列表来存贮我们的三个工具，并且通过列表的访问来调出使用的工具。

```
            if keys[pygame.K_q] :
                self.tool_index += 1
                self.tool_index = self.tool_index if self.tool_index < len(self.tools) else 0
                self.select_tool = self.tools[self.tool_index]
```

在input方法中我们添加对q键的监测，使得用户在按下q键的时候可以对工具的选择进行切换，并给引索值进行一些判断以防止它超过我们列表的范围而报错，接下来我们就可以把状态更新中的“\_axe”改为+ “\_” + self.select\_tool来更新状态了，这样我们就可以使用不同的工具了。（动画脑补）

我们可以给我们的工具切换增加个计时器来限制玩家过于频繁切换工具

```
'tool switch': Timer(200)
...
if keys[pygame.K_q] and not self.timers['tool switch'].active:
                self.timers['tool switch'].activate()
                self.tool_index += 1
                self.tool_index = self.tool_index if self.tool_index < len(self.tools) else 0
                self.select_tool = self.tools[self.tool_index]
```

在计时器字典中我们添加一个工具切换的计时器，它在结束时并不需要执行什么方法，并在监测按键的时候增加一个条件使得它只有在计时器不处于激活状态的时候执行下文语句。

## 工具图标的显示

为了让玩家能够清楚的知道当前是在使用什么工具，我们可以将当前选择的工具图标显示在屏幕中。为此我们新建一个overlay.py来单独管理。

```
import pygame
from settings import *

class Overlay:
    def __init__(self,player):

        #general setup
        self.display_surface = pygame.display.get_surface()
        self.player = player

        #imports
        overlay_path = '../graphics/overlay/'
        self.tools_surf = {tool:pygame.image.load(f'{overlay_path}{tool}.png').convert_alpha() for tool in player.tools}
     
    def display(self):

        #tool
        tool_surf = self.tools_surf[self.player.select_tool]
        tool_rect = tool_surf.get_rect(midbottom = OVERLAY_POSITIONS['tool'])
        self.display_surface.blit(tool_surf,tool_rect)
       
```

这和level中的设置都是大同小异，先获取当前的表面，同时获取我们player中的工具状态，所以我们需要传入player，后面按照常规将我们的图像导入并绘出在预设位置上。接下来我们回到level中调用此方法即可。

```
self.overlay = Overlay(self.player)
......
 def run(self,dt):
        self.display_surface.fill("black")
        self.all_sprites.draw(self.display_surface)
        self.all_sprites.update(dt)
        self.overlay.display()
```

如此以来我们就可以将当前工具的图标显示屏幕的左下角了。（脑补画面）后面还有种子的选择与使用，依葫芦画瓢即可。

## 绘制背景

当前我们的主角还处于一片虚无中，让我们给他创建一个背景。并使得画面能够随着角色的移动而移动，我们新建一个sprites.py来管理。

```
import pygame
from settings import *

class Generic(pygame.sprite.Sprite):
    def __init__(self,pos,surf,groups):
        super().__init__(groups)
        self.image = surf
        self.rect = self.image.get_rect(topleft = pos)
```

我们回到level中调用此方法。

```
    def setup(self):
        Generic(
            pos = (0,0),
            surf = pygame.image.load("../graphics/world/ground.png").convert_alpha(),
            groups = self.all_sprites)
        self.player = Player((640,360),self.all_sprites)
```

将我们的背景创建并添加到精灵组中。接下来我们就能够显示出背景来了。（画面脑补）

## 添加相机

现在的状态是只有玩家会动，地图处于一个静止状态，我们添加个相机来实现地图的移动。

```
import pygame
from settings import *

class Generic(pygame.sprite.Sprite):
def init(self,pos,surf,groups, z = LAYERS['main']):
super().init(groups)
self.image = surf
self.rect = self.image.get_rect(topleft = pos)
self.z = z
```

我们先给我们的画图添加个z轴来确保每个元素出现在它该出现的位置上。

```
class CameraGroup(pygame.sprite.Group):
    def __init__(self):
        super().__init__()
        self.display_surface = pygame.display.get_surface()
        self.offset = pygame.math.Vector2()

    def custom_draw(self,player):
        self.offset.x = player.rect.centerx - SCREEN_WIDTH / 2
        self.offset.y = player.rect.centery - SCREEN_HEIGHT / 2

        for layer in LAYERS.values():
            for sprite in self.sprites():
                if sprite.z == layer:
                    offset_rect = sprite.rect.copy()
                    offset_rect.center -= self.offset
                    self.display_surface.blit(sprite.image, offset_rect)
```

先获取当前表面，同时创建一个新的向量来存贮，在custom\_draw方法中，我们接收player并将摄像机固定在其上，计算出地图绘图所需要的偏移量（其实就是玩家移动的偏移量移交给地图），遍历LAYWES层，使得每个图案在其对应的层上，也就是z轴。获取每个精灵的矩形，将矩形的中心位置进行更新，再进行绘画

```
    def run(self,dt):
        self.display_surface.fill("black")
        #self.all_sprites.draw(self.display_surface)
        self.all_sprites.custom_draw(self.player)
        self.all_sprites.update(dt)

        self.overlay.display()
```

在run方法中调用custom\_draw()方法既可以确保每个图像在其该在的位置同时确保player在中心，让地图随着角色的运动而运动。（动画脑补）