import{$ as e,G as t,Jn as n,Jt as r,Ut as i,Vt as a,W as o,bn as s,tr as c}from"./framework.CjdSPkFv.js";import{n as l}from"./theme.Dt3khUt3.js";import"./reka-ui.CVRMFFNl.js";import{c as u,l as d}from"./chunks/vue-router.8e84d6cC.js";var f=`/assets/1731590538-%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2024-11-14-212208-1024x601.DQF2P_kl.png`,p=`/assets/1731590538-%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2024-11-14-212208-1024x601.DQF2P_kl.png`,m=`/assets/1731592808-%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2024-11-14-220011-1024x598.Chr9PcyS.png`,h=`/assets/1731595035-%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2024-11-14-223640-300x76.CuLbOzv8.png`,g=`/assets/1731595044-%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2024-11-14-223704-768x398.DwNNf5o4.png`,_={__name:`pygame-学习笔记1`,setup(_,{expose:v}){let y=n(JSON.parse(`{"title":"Pygame 学习笔记(1)","description":"","frontmatter":{"title":"Pygame 学习笔记(1)","date":"2024-11-14 22:41:45","categories":"未分类","tags":["算法"],"ogImage":"/og/default.png"},"headers":[{"level":2,"title":"Pygame的介绍","slug":"pygame的介绍","link":"#pygame的介绍","children":[]},{"level":2,"title":"Pygame的最基础框架","slug":"pygame的最基础框架","link":"#pygame的最基础框架","children":[]},{"level":2,"title":"屏幕的刷新","slug":"屏幕的刷新","link":"#屏幕的刷新","children":[]},{"level":2,"title":"一个简单的Player","slug":"一个简单的player","link":"#一个简单的player","children":[]},{"level":2,"title":"让Player运动起来","slug":"让player运动起来","link":"#让player运动起来","children":[]},{"level":2,"title":"写在最后","slug":"写在最后","link":"#写在最后","children":[]}],"relativePath":"pages/posts/pygame-学习笔记1.md","lastUpdated":1794066059000}`)),b=d(),x=u(),S=Object.assign(x.meta.frontmatter||{},y.value?.frontmatter||{});return b.currentRoute.value.data=y.value,i(`valaxy:frontmatter`,S),globalThis.$frontmatter=S,v({frontmatter:{title:`Pygame 学习笔记(1)`,date:`2024-11-14 22:41:45`,categories:`未分类`,tags:[`算法`],ogImage:`/og/default.png`}}),(n,i)=>{let u=l;return a(),t(u,{frontmatter:c(S)},{"main-content-md":s(()=>[...i[0]||=[o(`h2`,{id:`pygame的介绍`,tabindex:`-1`},[e(`Pygame的介绍 `),o(`a`,{class:`header-anchor`,href:`#pygame的介绍`,"aria-label":`Permalink to "Pygame的介绍"`},`​`)],-1),o(`p`,null,`bing一下你就知道，这里就不过多阐述了。`,-1),o(`h2`,{id:`pygame的最基础框架`,tabindex:`-1`},[e(`Pygame的最基础框架 `),o(`a`,{class:`header-anchor`,href:`#pygame的最基础框架`,"aria-label":`Permalink to "Pygame的最基础框架"`},`​`)],-1),o(`p`,null,`main.py`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`import pygame, sys`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`from settings import *`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`class Game:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`	def __init__(self):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`		pygame.init()#①`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`		self.screen = pygame.display.set_mode((SCREEN_WIDTH,SCREEN_HEIGHT))#②`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`		pygame.display.set_caption('Sprout land')#③`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`		self.clock = pygame.time.Clock()#④`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`	def run(self):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`		while True: `)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`			for event in pygame.event.get():`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`				if event.type == pygame.QUIT:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`					pygame.quit()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`					sys.exit()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`			dt = self.clock.tick() / 1000`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`			pygame.display.update()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`if __name__ == '__main__':`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`	game = Game()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`	game.run()`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`settings.py`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`from pygame.math import Vector2`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`# screen`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`SCREEN_WIDTH = 1280`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`SCREEN_HEIGHT = 720`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`上图就是pygame的最简单的框架启动器，其中定义了一个game类，里面包含一个初始化器与run函数，初始化器中①是进行pygame自带的初始化，②是创建一个窗口，（窗口的长宽数据存放在settings文件中，标准pygame起手式（坏笑），其目的也是为了我们后期方便更改数据和进行维护），③是给窗口设置标题，④是启动pygame中的计时器。在run函数中，我们进行了一个用户按键的监测，监测用户是否点击了退出按钮，和计算每一帧的时间dt(秒)，以及调用刷新函数update。现在启动这个程序你就可以得到一个黑框框，虽然有点单调，但终归是迈出了第一步。`,-1),o(`figure`,null,[o(`img`,{src:f,alt:``,loading:`lazy`,decoding:`async`})],-1),o(`h2`,{id:`屏幕的刷新`,tabindex:`-1`},[e(`屏幕的刷新 `),o(`a`,{class:`header-anchor`,href:`#屏幕的刷新`,"aria-label":`Permalink to "屏幕的刷新"`},`​`)],-1),o(`p`,null,`接下来我们不能总盯着黑黑的框傻乐，让我们小小操作一下，接来下我们创造一个level.py文件，把我们刷新屏幕的程序写在里面以保证我们整体代码的整洁性。`,-1),o(`p`,null,`level.py`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`import pygame`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`from settings import *`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`class Level:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def __init__(self):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        # get the display surface`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.display_surface = pygame.display.get_surface()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        # sprite groups`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.all_sprites = pygame.sprite.Group()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def run(self,dt):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.display_surface.fill("black")`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.all_sprites.draw(self.display_surface)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.all_sprites.update(dt)`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`在这里面中我们定义了一个Level类来控制屏幕的刷新，首先我们用get_surface函数获取当前显示界面，然后我们用Group函数创造一个精灵组来统一管理显示在此画面上的对象，如玩家，npc之类的。然后在run函数中使用fill函数给屏幕填充颜色，draw函数给当前显示界面绘画出精灵组的所有元素，这里由于我们的精灵组中并没有成员，所以屏幕还会是一片黑。update是精灵组的刷新函数，每过dt秒进行一次刷新。接下来我们回到main函数调用下刷新屏幕的函数即可。`,-1),o(`p`,null,`main.py`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`import pygame, sys`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`from settings import *`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`from level import Level`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`class Game:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`	def __init__(self):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`		pygame.init()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`		self.screen = pygame.display.set_mode((SCREEN_WIDTH,SCREEN_HEIGHT))`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`		pygame.display.set_caption('Sprout land')`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`		self.clock = pygame.time.Clock()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`		self.level = Level()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`	def run(self):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`		while True: `)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`			for event in pygame.event.get():`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`				if event.type == pygame.QUIT:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`					pygame.quit()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`					sys.exit()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`			dt = self.clock.tick() / 1000`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`			self.level.run(dt)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`			pygame.display.update()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`if __name__ == '__main__':`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`	game = Game()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`	game.run()`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`figure`,null,[o(`img`,{src:p,alt:``,loading:`lazy`,decoding:`async`})],-1),o(`p`,null,`好的，现在你可以接着对着黑框接着傻笑了。（坏笑）（如果不喜欢黑色的话，可自行调动参数。）可能你会有点疑惑，这一步似乎和第一步所展示出来的效果一样啊，为啥要这样做呢？（如果真这样想，那我可给难过了）。`,-1),o(`h2`,{id:`一个简单的player`,tabindex:`-1`},[e(`一个简单的Player `),o(`a`,{class:`header-anchor`,href:`#一个简单的player`,"aria-label":`Permalink to "一个简单的Player"`},`​`)],-1),o(`p`,null,`接下来我们要开始添加一些主角了，并试图让它运动起来。老规矩，为了保证整体代码的整洁，我们也将创建一个新的文件来存放player的代码。`,-1),o(`p`,null,`player.py`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`import pygame`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`from settings import *`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`class Player(pygame.sprite.Sprite):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def __init__(self,pos,group):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        super().__init__(group)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.image = pygame.Surface((32,64))`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.image.fill("green")`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.rect = self.image.get_rect(center = pos)`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`这里我们创造了一个Player类并使他继承于Sprite类（似乎我还没做继承，下次一定），super().__init__(group)是调用父类Sprite中初始化器中的group属性，然后我们用Surface函数给player加个小皮肤并填充绿色使其不会堕入黑暗，再用get_rect函数获取player的矩形，为后续做点小小的准备。接下来就让我们的Player显示出来吧。`,-1),o(`p`,null,`level.py`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`import pygame`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`from settings import *`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`from player import Player`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`class Level:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def __init__(self):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        # get the display surface`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.display_surface = pygame.display.get_surface()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        # sprite groups`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.all_sprites = pygame.sprite.Group()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.setup()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def setup(self):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.player = Player((640,360),self.all_sprites)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def run(self,dt):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.display_surface.fill("black")`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.all_sprites.draw(self.display_surface)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.all_sprites.update(dt)`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`回到我们的level.py文件中将我们的Player添加进去进行刷新，创建一个setup函数，将我们的player实例放在里面进行管理，传入坐标参数与精灵组，这样只要我们实例化一下setup函数后就可以显示出我们的Player了。（这里关于Player的显示可能会有点小绕，注意这里是将player已经加入到精灵组以内了）`,-1),o(`figure`,null,[o(`img`,{src:m,alt:``,loading:`lazy`,decoding:`async`})],-1),o(`h2`,{id:`让player运动起来`,tabindex:`-1`},[e(`让Player运动起来 `),o(`a`,{class:`header-anchor`,href:`#让player运动起来`,"aria-label":`Permalink to "让Player运动起来"`},`​`)],-1),o(`p`,null,`接下来步骤就简单明了，我们需要读取用户的按键输入并进行相应的反应。`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`import pygame`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`from settings import *`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`class Player(pygame.sprite.Sprite):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def __init__(self,pos,group):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        super().__init__(group)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        # general setup`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.image = pygame.Surface((32,64))`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.image.fill("green")`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.rect = self.image.get_rect(center = pos)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        # movement attributes`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.direction = pygame.math.Vector2()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.pos = pygame.math.Vector2(self.rect.center)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.speed = 200`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def input(self):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        keys = pygame.key.get_pressed()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        if keys[pygame.K_UP]:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            self.direction.y = -1`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        elif keys[pygame.K_DOWN]:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            self.direction.y = 1`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        else:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            self.direction.y = 0`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        if keys[pygame.K_RIGHT]:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            self.direction.x = 1`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        elif keys[pygame.K_LEFT]:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            self.direction.x = -1`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        else:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            self.direction.x = 0`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def move(self,dt):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        # normalizing a vector`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        if self.direction.magnitude() > 0:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            self.direction = self.direction.normalize()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        #horizontal movement`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.pos.x += self.direction.x * self.speed * dt`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.rect.centerx = self.pos.x`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        # vertical movement`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.pos.y += self.direction.y * self.speed * dt`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.rect.centery = self.pos.y`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    def update(self, dt):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.input()`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        self.move(dt)`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`这里我们需要增添向量来记录player的位置以及运动情况，Vector2函数就创建了一个二维向量，同时将Player的矩形中心也转换成二维向量，在来个速度，这些都显而易见。定义一个input函数来监测键盘的输入，get_pressed函数返回一个元组，表示当前所有键盘按键的状态（按下或未按下），你可以通过检查元组中的特定键位来确定哪个键被按下。（这句话复制来的），接下来就是move函数来控制Player的运动，这个也是显而易见。需要注意的是，normalize函数是将速度标准化的（要是没记错应该是这个词），因为当物体向左上移动的时候，根据勾股定理显然速度会加快，这里大概理解一下就得行，不加以深入，因为当传入参数为[0,0]时会报错，所以给进行个小判断，也不过多阐述，记住就好了。然后就是update刷新函数了。这里我一时没找到刷新函数在哪里调用了，我觉得应该是方法重写，由于继承了Sprite类，猜测update应该是对精灵的刷新函数进行了重写，每次进行精灵刷新的时候就会调用每个精灵中的update函数。`,-1),o(`figure`,null,[o(`img`,{src:h,alt:``,loading:`lazy`,decoding:`async`})],-1),o(`figure`,null,[o(`img`,{src:g,alt:``,loading:`lazy`,decoding:`async`})],-1),o(`h2`,{id:`写在最后`,tabindex:`-1`},[e(`写在最后 `),o(`a`,{class:`header-anchor`,href:`#写在最后`,"aria-label":`Permalink to "写在最后"`},`​`)],-1),o(`p`,null,[e(`由于本人实力有限，此学习笔记会存在很多不足，只能做到对实例的一个简单过程回忆和剖析，并不能算作一个教程，如果跟着这个笔记走的话，可能要费很大的劲。这里将教学视频链接贴出`),o(`a`,{href:`https://www.bilibili.com/video/BV1ia411d7yW?spm_id_from=333.788.videopod.episodes&vd_source=18d81eba7a49a9cf96b5b4e18a005d7f`,target:`_blank`,rel:`noreferrer`},`https://www.bilibili.com/video/BV1ia411d7yW?spm_id_from=333.788.videopod.episodes&vd_source=18d81eba7a49a9cf96b5b4e18a005d7f`)],-1)]]),main:s(()=>[r(n.$slots,`main`)]),"main-header":s(()=>[r(n.$slots,`main-header`)]),"main-header-after":s(()=>[r(n.$slots,`main-header-after`)]),"main-nav":s(()=>[r(n.$slots,`main-nav`)]),"main-content-before":s(()=>[r(n.$slots,`main-content-before`)]),"main-content":s(()=>[r(n.$slots,`main-content`)]),"main-content-after":s(()=>[r(n.$slots,`main-content-after`)]),"main-nav-before":s(()=>[r(n.$slots,`main-nav-before`)]),"main-nav-after":s(()=>[r(n.$slots,`main-nav-after`)]),comment:s(()=>[r(n.$slots,`comment`)]),footer:s(()=>[r(n.$slots,`footer`)]),aside:s(()=>[r(n.$slots,`aside`)]),"aside-custom":s(()=>[r(n.$slots,`aside-custom`)]),default:s(()=>[r(n.$slots,`default`)]),_:3},8,[`frontmatter`])}}};export{_ as default};