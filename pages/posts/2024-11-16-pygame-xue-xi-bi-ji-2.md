---
title: Pygame学习笔记(2)
date: 2024-11-16
tags:
  - 算法
---

## 创建一个属于自己的角色吧

在昨天已经我们已经创造了一个可移动的小绿色方块，今天让我们更进一步。

![](/images/2024/11/202411-176c6640.webp)![](/images/2024/11/202411-8dbca65d.webp)在资源包中，我们已经准备好了各个素材，接下来只要导入就可。

player.py

```
def import_assets(self):
        self.animations = {'up':[],'down':[],'left':[],'right':[],
                            'right_idle':[],'left_idle':[],'up_idle':[],'down_idle':[],
                            'right_hoe':[],'left_hoe':[],'up_hoe':[],'down_hoe':[],
                            'right_axe':[],'left_axe':[],'up_axe':[],'down_axe':[],
                            'right_water':[],'left_water':[],'up_water':[],'down_water':[]}
```

为了方便管理，我们在player中新定义一个import\_assets方法用于导入我们的资源，用一个字典来存储我们所有的资源，这样就可以通过字典的key来快速访问。

```
for animation in self.animations.keys():
            full_path = '../graphics/character/' + animation
            self.animations[animation] = import_folder(full_path)
```

接下来通过遍历字典来给我们的各个状态添加图片列表。这里使用import\_folder方法来接受图片的地址并将加载好的图片列表返回回去。为此我们新创建一个文件support.py，并将我们的import\_folder函数放在其中。

support.py

```
from os import walk
import pygame

def import_folder(path):
    surface_list = []

    for _,__,img_files in walk(path):
        for image in img_files:
            full_path = path + '/' + image
            image_surf = pygame.image.load(full_path).convert_alpha()
            surface_list.append(image_surf)
    return surface_list
```

这里我们使用walk函数来遍历每个状态,walk函数返回三个元组(root,dirs,files)，root 所指的是当前正在遍历的这个文件夹的本身的地址，dirs 是一个 list ，内容是该文件夹中所有的目录的名字(不包括子目录)，files 同样是 list , 内容是该文件夹中所有的文件(不包括子目录)，我们这里只需要第三个即可，随后加载图片并转换来提高帧率，随后返回我们的图片列表给animations字典，这样我们就成功将素材全部导入了。接下来就可以把我们的小绿框给换掉了。

```
        self.import_assets()
        self.status = 'down_idle'
        self.frame_index = 0

        self.image = self.animations[self.status][self.frame_index]
```

在player.py文件的初始化器开头先进行我们的资源导入，再通过遍历字典即可。

让我们在player.py中定义一个animate来控制动画。

```
def animate(self,dt):
        self.frame_index += 4 * dt
        if self.frame_index >= len(self.animations[self.status]):
            self.frame_index = 0
        self.image = self.animations[self.status][int(self.frame_index)]
```

随着时间的增加我们的图片引索也随之增加，当我们的数值要超过引索要范围时将引索值归零可以使得动画一直来回播放。

接下来我们还需要监测玩家的运动状态，使得动画的显示正确。在我们的input方法中对状态进行修改即可。

```
def input(self):
        keys = pygame.key.get_pressed()

        if keys[pygame.K_UP]:
            self.direction.y = -1
            self.status = 'up'
        elif keys[pygame.K_DOWN]:
            self.direction.y = 1
            self.status = 'down'
        else:
            self.direction.y = 0

        if keys[pygame.K_RIGHT]:
            self.direction.x = 1
            self.status = 'right'
        elif keys[pygame.K_LEFT]:
            self.direction.x = -1
            self.status = 'left'
        else:
            self.direction.x = 0
```

现在我们还需要监测出玩家是否处于运动状态来播放静止动画

def get\_status(self):  
 if self.direction.magnitude() == 0:  
 self.status = self.status.split('\_')\[0\] + "\_idle"

在这里我们进行监测向量，如果向量为零就是禁止状态，这时候我们给我们的状态添加一个\_idle后缀即可播放不同状态下的静止动画，由于这个函数会随着刷新调用多次，就会出现down\_idle\_idle的情况，此时我们将字符串分割并返回第一个部分在进行处理即可解决，最后将状态监测和运动方法添加到刷新方法中即可实现一个可正常运动的角色了。