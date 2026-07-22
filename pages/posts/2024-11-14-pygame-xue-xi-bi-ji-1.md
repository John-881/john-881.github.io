---
title: Pygame 学习笔记(1)
date: 2024-11-14
tags:
  - 算法
---

## Pygame的介绍

bing一下你就知道，这里就不过多阐述了。

## Pygame的最基础框架

main.py

```
import pygame, sys
from settings import *

class Game:
	def __init__(self):
		pygame.init()#①
		self.screen = pygame.display.set_mode((SCREEN_WIDTH,SCREEN_HEIGHT))#②
		pygame.display.set_caption('Sprout land')#③
		self.clock = pygame.time.Clock()#④

	def run(self):
		while True: 
			for event in pygame.event.get():
				if event.type == pygame.QUIT:
					pygame.quit()
					sys.exit()

			dt = self.clock.tick() / 1000
			pygame.display.update()

if __name__ == '__main__':
	game = Game()
	game.run()

```

settings.py

```
from pygame.math import Vector2
# screen
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
```

上图就是pygame的最简单的框架启动器，其中定义了一个game类，里面包含一个初始化器与run函数，初始化器中①是进行pygame自带的初始化，②是创建一个窗口，（窗口的长宽数据存放在settings文件中，标准pygame起手式（坏笑），其目的也是为了我们后期方便更改数据和进行维护），③是给窗口设置标题，④是启动pygame中的计时器。在run函数中，我们进行了一个用户按键的监测，监测用户是否点击了退出按钮，和计算每一帧的时间dt(秒)，以及调用刷新函数update。现在启动这个程序你就可以得到一个黑框框，虽然有点单调，但终归是迈出了第一步。

![](/images/2024/11/202411-65a30ca7.webp)## 屏幕的刷新

接下来我们不能总盯着黑黑的框傻乐，让我们小小操作一下，接来下我们创造一个level.py文件，把我们刷新屏幕的程序写在里面以保证我们整体代码的整洁性。

level.py

```
import pygame
from settings import *

class Level:
    def __init__(self):

        # get the display surface
        self.display_surface = pygame.display.get_surface()

        # sprite groups
        self.all_sprites = pygame.sprite.Group()

    def run(self,dt):
        self.display_surface.fill("black")
        self.all_sprites.draw(self.display_surface)
        self.all_sprites.update(dt)
```

在这里面中我们定义了一个Level类来控制屏幕的刷新，首先我们用get\_surface函数获取当前显示界面，然后我们用Group函数创造一个精灵组来统一管理显示在此画面上的对象，如玩家，npc之类的。然后在run函数中使用fill函数给屏幕填充颜色，draw函数给当前显示界面绘画出精灵组的所有元素，这里由于我们的精灵组中并没有成员，所以屏幕还会是一片黑。update是精灵组的刷新函数，每过dt秒进行一次刷新。接下来我们回到main函数调用下刷新屏幕的函数即可。

main.py

```
import pygame, sys
from settings import *
from level import Level

class Game:
	def __init__(self):
		pygame.init()
		self.screen = pygame.display.set_mode((SCREEN_WIDTH,SCREEN_HEIGHT))
		pygame.display.set_caption('Sprout land')
		self.clock = pygame.time.Clock()
		self.level = Level()

	def run(self):
		while True: 
			for event in pygame.event.get():
				if event.type == pygame.QUIT:
					pygame.quit()
					sys.exit()

			dt = self.clock.tick() / 1000
			self.level.run(dt)
			pygame.display.update()

if __name__ == '__main__':
	game = Game()
	game.run()

```

![](/images/2024/11/202411-65a30ca7.webp)好的，现在你可以接着对着黑框接着傻笑了。（坏笑）（如果不喜欢黑色的话，可自行调动参数。）可能你会有点疑惑，这一步似乎和第一步所展示出来的效果一样啊，为啥要这样做呢？（如果真这样想，那我可给难过了）。

## 一个简单的Player

接下来我们要开始添加一些主角了，并试图让它运动起来。老规矩，为了保证整体代码的整洁，我们也将创建一个新的文件来存放player的代码。

player.py

```
import pygame
from settings import *

class Player(pygame.sprite.Sprite):
    def __init__(self,pos,group):
        super().__init__(group)

        self.image = pygame.Surface((32,64))
        self.image.fill("green")
        self.rect = self.image.get_rect(center = pos)

```

这里我们创造了一个Player类并使他继承于Sprite类（似乎我还没做继承，下次一定），super().\_\_init\_\_(group)是调用父类Sprite中初始化器中的group属性，然后我们用Surface函数给player加个小皮肤并填充绿色使其不会堕入黑暗，再用get\_rect函数获取player的矩形，为后续做点小小的准备。接下来就让我们的Player显示出来吧。

level.py

```
import pygame
from settings import *
from player import Player

class Level:
    def __init__(self):

        # get the display surface
        self.display_surface = pygame.display.get_surface()

        # sprite groups
        self.all_sprites = pygame.sprite.Group()

        self.setup()
    def setup(self):
        self.player = Player((640,360),self.all_sprites)

    def run(self,dt):
        self.display_surface.fill("black")
        self.all_sprites.draw(self.display_surface)
        self.all_sprites.update(dt)
```

回到我们的level.py文件中将我们的Player添加进去进行刷新，创建一个setup函数，将我们的player实例放在里面进行管理，传入坐标参数与精灵组，这样只要我们实例化一下setup函数后就可以显示出我们的Player了。（这里关于Player的显示可能会有点小绕，注意这里是将player已经加入到精灵组以内了）

![](/images/2024/11/202411-3400056c.webp)## 让Player运动起来

接下来步骤就简单明了，我们需要读取用户的按键输入并进行相应的反应。

```
import pygame
from settings import *

class Player(pygame.sprite.Sprite):
    def __init__(self,pos,group):
        super().__init__(group)

        # general setup
        self.image = pygame.Surface((32,64))
        self.image.fill("green")
        self.rect = self.image.get_rect(center = pos)

        # movement attributes
        self.direction = pygame.math.Vector2()
        self.pos = pygame.math.Vector2(self.rect.center)
        self.speed = 200

    def input(self):
        keys = pygame.key.get_pressed()

        if keys[pygame.K_UP]:
            self.direction.y = -1
        elif keys[pygame.K_DOWN]:
            self.direction.y = 1
        else:
            self.direction.y = 0

        if keys[pygame.K_RIGHT]:
            self.direction.x = 1
        elif keys[pygame.K_LEFT]:
            self.direction.x = -1
        else:
            self.direction.x = 0
    def move(self,dt):

        # normalizing a vector
        if self.direction.magnitude() > 0:
            self.direction = self.direction.normalize()

        #horizontal movement
        self.pos.x += self.direction.x * self.speed * dt
        self.rect.centerx = self.pos.x

        # vertical movement
        self.pos.y += self.direction.y * self.speed * dt
        self.rect.centery = self.pos.y

    def update(self, dt):
        self.input()
        self.move(dt)
```

这里我们需要增添向量来记录player的位置以及运动情况，Vector2函数就创建了一个二维向量，同时将Player的矩形中心也转换成二维向量，在来个速度，这些都显而易见。定义一个input函数来监测键盘的输入，get\_pressed函数返回一个元组，表示当前所有键盘按键的状态（按下或未按下），你可以通过检查元组中的特定键位来确定哪个键被按下。（这句话复制来的），接下来就是move函数来控制Player的运动，这个也是显而易见。需要注意的是，normalize函数是将速度标准化的（要是没记错应该是这个词），因为当物体向左上移动的时候，根据勾股定理显然速度会加快，这里大概理解一下就得行，不加以深入，因为当传入参数为\[0,0\]时会报错，所以给进行个小判断，也不过多阐述，记住就好了。然后就是update刷新函数了。这里我一时没找到刷新函数在哪里调用了，我觉得应该是方法重写，由于继承了Sprite类，猜测update应该是对精灵的刷新函数进行了重写，每次进行精灵刷新的时候就会调用每个精灵中的update函数。

![](/images/2024/11/202411-48bdd907.webp)![](/images/2024/11/202411-db644c2f.webp)## 写在最后

由于本人实力有限，此学习笔记会存在很多不足，只能做到对实例的一个简单过程回忆和剖析，并不能算作一个教程，如果跟着这个笔记走的话，可能要费很大的劲。这里将教学视频链接贴出[https://www.bilibili.com/video/BV1ia411d7yW?spm\_id\_from=333.788.videopod.episodes&vd\_source=18d81eba7a49a9cf96b5b4e18a005d7f](https://www.bilibili.com/video/BV1ia411d7yW?spm_id_from=333.788.videopod.episodes&vd_source=18d81eba7a49a9cf96b5b4e18a005d7f)