---
title: Pygame学习笔记（5）
date: 2024-11-20
tags:
  - 算法
---

## 碰撞

为了监测碰撞，我们需要给能够碰撞的元素添加一个碰撞箱。我们不使用原来获得的矩形，毕竟那个真的是太大了。先给我们的player添加。

```
self.hitbox = self.rect.copy().inflate((-126,-70))
```

在player的初始化器中，我们将原来的矩形复制并用inflate方法给它缩小一些作为我们的碰撞箱。

接下来给我们的精灵组中的元素也添加上碰撞箱，需要注意的是，我们的碰撞箱应当使用另一个精灵组来存贮。

```
        # sprite groups
        self.all_sprites = CameraGroup()
        self.collision_sprites = pygame.sprite.Group()
```

在level的初始化器中我们添加个新的精灵组来贮存每个精灵的碰撞箱。

```
#Fence
        for x,y,surf in tmx_data.get_layer_by_name('Fence').tiles():
            Generic((x * TILE_SIZE,y * TILE_SIZE),surf,[self.all_sprites,self.collision_sprites])
#trees
        for obj in tmx_data.get_layer_by_name('Trees'):
            Tree((obj.x,obj.y),obj.image,[self.all_sprites,self.collision_sprites],obj.name)
#wildflowers
        for obj in tmx_data.get_layer_by_name('Decoration'):
            WildFlower((obj.x,obj.y),obj.image,[self.all_sprites,self.collision_sprites])
```

同时将我们的栅栏等元素添加进碰撞箱精灵组中。

```
class Generic(pygame.sprite.Sprite):
    def __init__(self,pos,surf,groups, z = LAYERS['main']):
        super().__init__(groups)
        self.image = surf
        self.rect = self.image.get_rect(topleft = pos)
        self.z = z
        self.hitbox = self.rect.copy().inflate(-self.rect.width *0.2,-self.rect.height * 0.75)
class WildFlower(Generic):
    def __init__(self,pos,surf,groups):
        super().__init__(pos,surf,groups)
        self.hitbox = self.rect.copy().inflate(-20,-self.rect.height * 0.9)
```

回到sprite中，我们给Generic类添加碰撞箱这一属性，同样将其缩放至一个合理的大小。对于花我们希望它的碰撞箱应该更小点，所以我们重新定义它的碰撞箱。现在我们有了碰撞箱就可以监测碰撞了。回到player中，首先我们将碰撞箱传入到我们的player中并初始化它。

```
def collision(self,direction):
        for sprite in self.collision_sprites.sprites():
            if hasattr(sprite,'hitbox'):
                if sprite.hitbox.colliderect(self.hitbox):
                    if direction == 'horizontal':
                        if self.direction.x > 0: # moving right
                            self.hitbox.right = sprite.hitbox.left
                        if self.direction.x < 0:#moving left
                            self.hitbox.left = sprite.hitbox.right
                        self.rect.centerx = self.hitbox.centerx
                        self.pos.x = self.hitbox.centerx
                    if direction == "vertical":
                        if self.direction.y > 0: # moving down
                            self.hitbox.bottom = sprite.hitbox.top
                        if self.direction.y < 0:#moving up
                            self.hitbox.top = sprite.hitbox.bottom
                        self.rect.centery = self.hitbox.centery
                        self.pos.y = self.hitbox.centery
```

我们定义一个碰撞方法，hasattr方法用于检测对象是否存在指定属性，这里我们检测我们的精灵是否含有hitbox这一属性。然后用colliderect方法监测player与碰撞精灵的碰撞箱是否重合（需要指出的是，这里如果边缘重合的话是不算碰撞的），接下来我们需要确定碰撞发生的方向，如果发生了碰撞我们就将玩家给移动到碰撞箱外部，在根据碰撞箱的位置给玩家位置进行更新。

```
        #horizontal movement
        self.pos.x += self.direction.x * self.speed * dt
        self.hitbox.centerx = round(self.pos.x)
        self.rect.centerx = self.hitbox.centerx
        self.collision('horizontal')

        # vertical movement
        self.pos.y += self.direction.y * self.speed * dt
        self.hitbox.centery = round(self.pos.y)
        self.rect.centery = self.hitbox.centery
        self.collision('vertical')
```

在move方法中我们进行碰撞监测，如此以来，我们就可以实现碰撞效果了。

```
        # Player
        for obj in tmx_data.get_layer_by_name('Player'):
            if obj.name == 'Start':
                self.player = Player((obj.x,obj.y),self.all_sprites,self.collision_sprites)
```

在level中的setup方法中我们更改下对玩家出生地的刷新，在地图中已经定义了一个刷新点，我们只需要读取获得即可。

```
    #collion tiles
    for x,y,surf in tmx_data.get_layer_by_name('Collision').tiles():
        Generic((x*TILE_SIZE,y*TILE_SIZE),pygame.Surface((TILE_SIZE,TILE_SIZE)),self.collision_sprites)
```

同样的，在地图中我们已经有了空气墙，也可通过相同的方法将其绘制出来，并将其添加至碰撞精灵组中进行碰撞的监测。（在示例代码中，我们重新绘制了一个表面，如果你直接用surf也是可以实现相同的效果的，或许这里存在着什么我没有考虑到的东西）