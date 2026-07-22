---
title: Pygame学习笔记（4）
date: 2024-11-20
tags:
  - 算法
---

## 给场景添加一些别的地图元素

这里视频中用到了pytmx，即地图绘制器，这里我们直接使用作者绘制好的地图。首先要确保电脑中安装了pytmx库。随后回到level.py中，将库导入。

```
from pytmx.util_pygame import load_pygame
```

在setup方法中我们创建地图的剩下的元素。

```
tmx_data = load_pygame('../data/map.tmx')
#house
for layer in ['HouseFloor', 'HouseFurnitureBottom']:
   for x,y,surf in tmx_data.get_layer_by_name(layer).tiles():
       Generic((x * TILE_SIZE,y * TILE_SIZE),surf,self.all_sprites,LAYERS['house bottom'])
for layer in ['HouseWalls', 'HouseFurnitureTop']:
   for x,y,surf in tmx_data.get_layer_by_name(layer).tiles():
       Generic((x * TILE_SIZE,y * TILE_SIZE),surf,self.all_sprites)
        
```

读取我们的地图数据，然后遍历地图中的元素，将其添加到我们的Generic类中，并绘制出来。这样就能绘画出房子了。接下来回到sprites.py中我们开始准备绘画水，向日葵和树。

```
class Water(Generic):
    def __init__(self,pos,frames,groups):
        #animation setup
        self.frames = frames
        self.frame_index = 0
        #sprite setup
        super().__init__(
            pos = pos,
            surf = self.frames[self.frame_index],
            groups = groups,
            z = LAYERS["water"])

    def animate(self,dt):
        self.frame_index += 5 * dt
        if self.frame_index >= len(self.frames):
            self.frame_index = 0
        self.image = self.frames[int(self.frame_index)]

    def update(self,dt):
        self.animate(dt)

class WildFlower(Generic):
    def __init__(self,pos,surf,groups):
        super().__init__(pos,surf,groups)

class Tree(Generic):
    def __init__(self,pos,surf,groups,name):
        super().__init__(pos,surf,groups)
```

这三个类后续都需要增加而外的功能，所以我们分别增添一个新类来储存，并使他继承于原本的Generic类，由于水是有流动动画的，所以我们给它添加一个运动方法，幸运的是，之前我们在player中写了运动方法，这里依葫芦画瓢即可，向日葵和树我们暂且绘画出即可。回到level中我们导入这几个方法，并创造剩下的元素。

```
        #water
        water_frames = import_folder('../graphics/water')
        for x,y,surf in tmx_data.get_layer_by_name('Water').tiles():
            Water((x * TILE_SIZE,y * TILE_SIZE),water_frames,self.all_sprites)
        #trees
        for obj in tmx_data.get_layer_by_name('Trees'):
            Tree((obj.x,obj.y),obj.image,self.all_sprites,obj.name)
        #wildflowers
        for obj in tmx_data.get_layer_by_name('Decoration'):
            WildFlower((obj.x,obj.y),obj.image,self.all_sprites)
```

这里的tiles方法是将地图中的每个元素对象都拆分成了，坐标和图片属性，由于树和花还有别的用处，这边就不拆分了（我猜测的），接下来你就可以看到动态的水，各类树和花了。

## 覆盖显示问题

目前的player会走在所有它之下的图层上，会被所有比他图层高的给覆盖。而我们需要一个合理的覆盖，使得我们的play既可以藏在树后也可以在树前，而不是单纯的将树给覆盖。其实很简单解决，对我们的摄像机类做点小小的改动即可。

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
            for sprite in sorted(self.sprites(), key = lambda sprite: sprite.rect.centery):
                if sprite.z == layer:
                    offset_rect = sprite.rect.copy()
                    offset_rect.center -= self.offset
                    self.display_surface.blit(sprite.image, offset_rect)
```

当循环绘制精灵组的时候，对我们的精灵组进行个重新排序，使得y轴更小的位于列表之前，更先绘制即可。lambda是python中保留的关键字，属于一个匿名函数，即没有函数名，如上文lambda sprite: sprite.rect.centery即为接受sprite参数，然后返回 sprite.rect.centery。

再看个例子：`add = lambda x, y: x+y`  
相当于定义了加法函数`lambda x, y: x+y`，并将其赋值给变量`add`，这样变量`add`就指向了具有加法功能的函数。  
这时我们如果执行`add(1, 2)`，其输出结果就为 `3`。