import{Bt as e,Ht as t,Q as n,U as r,W as i,er as a,qn as o,qt as s,yn as c}from"./framework.BTQirQJB.js";import{t as l}from"./theme.B62cWSQb.js";import"./chunks/vue-i18n.Dk9JKhVE.js";import{a as u,i as d}from"./chunks/vue-router.SqDC-DRA.js";var f={__name:`2024-11-14-pygame-xue-xi-bi-ji-1`,setup(f,{expose:p}){let m=o(JSON.parse(`{"title":"Pygame 学习笔记(1)","description":"","frontmatter":{"title":"Pygame 学习笔记(1)","date":"2024-11-14","tags":["算法"],"firstImage":"/images/2024/11/202411-65a30ca7.webp"},"headers":[],"relativePath":"pages/posts/2024-11-14-pygame-xue-xi-bi-ji-1.md"}`)),h=u(),g=d(),_=Object.assign(g.meta.frontmatter||{},m.value?.frontmatter||{});return h.currentRoute.value.data=m.value,t(`valaxy:frontmatter`,_),globalThis.$frontmatter=_,p({frontmatter:{title:`Pygame 学习笔记(1)`,date:`2024-11-14`,tags:[`算法`]}}),(t,o)=>{let u=l;return e(),i(u,{frontmatter:a(_)},{"main-content-md":c(()=>[...o[0]||=[r(`h2`,{id:`pygame的介绍`,tabindex:`-1`},[n(`Pygame的介绍 `),r(`a`,{class:`header-anchor`,href:`#pygame的介绍`,"aria-label":`Permalink to "Pygame的介绍"`},`​`)],-1),r(`p`,null,`bing一下你就知道，这里就不过多阐述了。`,-1),r(`h2`,{id:`pygame的最基础框架`,tabindex:`-1`},[n(`Pygame的最基础框架 `),r(`a`,{class:`header-anchor`,href:`#pygame的最基础框架`,"aria-label":`Permalink to "Pygame的最基础框架"`},`​`)],-1),r(`p`,null,`main.py`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`import pygame, sys`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`from settings import *`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`class Game:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`	def __init__(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`		pygame.init()#①`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`		self.screen = pygame.display.set_mode((SCREEN_WIDTH,SCREEN_HEIGHT))#②`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`		pygame.display.set_caption('Sprout land')#③`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`		self.clock = pygame.time.Clock()#④`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`	def run(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`		while True: `)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`			for event in pygame.event.get():`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`				if event.type == pygame.QUIT:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`					pygame.quit()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`					sys.exit()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`			dt = self.clock.tick() / 1000`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`			pygame.display.update()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`if __name__ == '__main__':`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`	game = Game()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`	game.run()`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`settings.py`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`from pygame.math import Vector2`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`# screen`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`SCREEN_WIDTH = 1280`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`SCREEN_HEIGHT = 720`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`上图就是pygame的最简单的框架启动器，其中定义了一个game类，里面包含一个初始化器与run函数，初始化器中①是进行pygame自带的初始化，②是创建一个窗口，（窗口的长宽数据存放在settings文件中，标准pygame起手式（坏笑），其目的也是为了我们后期方便更改数据和进行维护），③是给窗口设置标题，④是启动pygame中的计时器。在run函数中，我们进行了一个用户按键的监测，监测用户是否点击了退出按钮，和计算每一帧的时间dt(秒)，以及调用刷新函数update。现在启动这个程序你就可以得到一个黑框框，虽然有点单调，但终归是迈出了第一步。`,-1),r(`p`,null,[r(`img`,{src:`/images/2024/11/202411-65a30ca7.webp`,alt:``}),n(`## 屏幕的刷新`)],-1),r(`p`,null,`接下来我们不能总盯着黑黑的框傻乐，让我们小小操作一下，接来下我们创造一个level.py文件，把我们刷新屏幕的程序写在里面以保证我们整体代码的整洁性。`,-1),r(`p`,null,`level.py`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`import pygame`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`from settings import *`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`class Level:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def __init__(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        # get the display surface`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.display_surface = pygame.display.get_surface()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        # sprite groups`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.all_sprites = pygame.sprite.Group()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def run(self,dt):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.display_surface.fill("black")`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.all_sprites.draw(self.display_surface)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.all_sprites.update(dt)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`在这里面中我们定义了一个Level类来控制屏幕的刷新，首先我们用get_surface函数获取当前显示界面，然后我们用Group函数创造一个精灵组来统一管理显示在此画面上的对象，如玩家，npc之类的。然后在run函数中使用fill函数给屏幕填充颜色，draw函数给当前显示界面绘画出精灵组的所有元素，这里由于我们的精灵组中并没有成员，所以屏幕还会是一片黑。update是精灵组的刷新函数，每过dt秒进行一次刷新。接下来我们回到main函数调用下刷新屏幕的函数即可。`,-1),r(`p`,null,`main.py`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`import pygame, sys`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`from settings import *`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`from level import Level`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`class Game:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`	def __init__(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`		pygame.init()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`		self.screen = pygame.display.set_mode((SCREEN_WIDTH,SCREEN_HEIGHT))`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`		pygame.display.set_caption('Sprout land')`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`		self.clock = pygame.time.Clock()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`		self.level = Level()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`	def run(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`		while True: `)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`			for event in pygame.event.get():`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`				if event.type == pygame.QUIT:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`					pygame.quit()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`					sys.exit()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`			dt = self.clock.tick() / 1000`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`			self.level.run(dt)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`			pygame.display.update()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`if __name__ == '__main__':`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`	game = Game()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`	game.run()`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,[r(`img`,{src:`/images/2024/11/202411-65a30ca7.webp`,alt:``}),n(`好的，现在你可以接着对着黑框接着傻笑了。（坏笑）（如果不喜欢黑色的话，可自行调动参数。）可能你会有点疑惑，这一步似乎和第一步所展示出来的效果一样啊，为啥要这样做呢？（如果真这样想，那我可给难过了）。`)],-1),r(`h2`,{id:`一个简单的player`,tabindex:`-1`},[n(`一个简单的Player `),r(`a`,{class:`header-anchor`,href:`#一个简单的player`,"aria-label":`Permalink to "一个简单的Player"`},`​`)],-1),r(`p`,null,`接下来我们要开始添加一些主角了，并试图让它运动起来。老规矩，为了保证整体代码的整洁，我们也将创建一个新的文件来存放player的代码。`,-1),r(`p`,null,`player.py`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`import pygame`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`from settings import *`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`class Player(pygame.sprite.Sprite):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def __init__(self,pos,group):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        super().__init__(group)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.image = pygame.Surface((32,64))`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.image.fill("green")`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.rect = self.image.get_rect(center = pos)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`这里我们创造了一个Player类并使他继承于Sprite类（似乎我还没做继承，下次一定），super().__init__(group)是调用父类Sprite中初始化器中的group属性，然后我们用Surface函数给player加个小皮肤并填充绿色使其不会堕入黑暗，再用get_rect函数获取player的矩形，为后续做点小小的准备。接下来就让我们的Player显示出来吧。`,-1),r(`p`,null,`level.py`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`import pygame`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`from settings import *`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`from player import Player`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`class Level:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def __init__(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        # get the display surface`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.display_surface = pygame.display.get_surface()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        # sprite groups`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.all_sprites = pygame.sprite.Group()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.setup()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def setup(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.player = Player((640,360),self.all_sprites)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def run(self,dt):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.display_surface.fill("black")`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.all_sprites.draw(self.display_surface)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.all_sprites.update(dt)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`回到我们的level.py文件中将我们的Player添加进去进行刷新，创建一个setup函数，将我们的player实例放在里面进行管理，传入坐标参数与精灵组，这样只要我们实例化一下setup函数后就可以显示出我们的Player了。（这里关于Player的显示可能会有点小绕，注意这里是将player已经加入到精灵组以内了）`,-1),r(`p`,null,[r(`img`,{src:`/images/2024/11/202411-3400056c.webp`,alt:``}),n(`## 让Player运动起来`)],-1),r(`p`,null,`接下来步骤就简单明了，我们需要读取用户的按键输入并进行相应的反应。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`import pygame`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`from settings import *`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`class Player(pygame.sprite.Sprite):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def __init__(self,pos,group):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        super().__init__(group)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        # general setup`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.image = pygame.Surface((32,64))`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.image.fill("green")`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.rect = self.image.get_rect(center = pos)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        # movement attributes`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.direction = pygame.math.Vector2()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.pos = pygame.math.Vector2(self.rect.center)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.speed = 200`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def input(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        keys = pygame.key.get_pressed()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        if keys[pygame.K_UP]:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            self.direction.y = -1`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        elif keys[pygame.K_DOWN]:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            self.direction.y = 1`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        else:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            self.direction.y = 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        if keys[pygame.K_RIGHT]:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            self.direction.x = 1`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        elif keys[pygame.K_LEFT]:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            self.direction.x = -1`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        else:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            self.direction.x = 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def move(self,dt):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        # normalizing a vector`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        if self.direction.magnitude() > 0:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            self.direction = self.direction.normalize()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        #horizontal movement`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.pos.x += self.direction.x * self.speed * dt`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.rect.centerx = self.pos.x`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        # vertical movement`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.pos.y += self.direction.y * self.speed * dt`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.rect.centery = self.pos.y`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def update(self, dt):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.input()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.move(dt)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`这里我们需要增添向量来记录player的位置以及运动情况，Vector2函数就创建了一个二维向量，同时将Player的矩形中心也转换成二维向量，在来个速度，这些都显而易见。定义一个input函数来监测键盘的输入，get_pressed函数返回一个元组，表示当前所有键盘按键的状态（按下或未按下），你可以通过检查元组中的特定键位来确定哪个键被按下。（这句话复制来的），接下来就是move函数来控制Player的运动，这个也是显而易见。需要注意的是，normalize函数是将速度标准化的（要是没记错应该是这个词），因为当物体向左上移动的时候，根据勾股定理显然速度会加快，这里大概理解一下就得行，不加以深入，因为当传入参数为[0,0]时会报错，所以给进行个小判断，也不过多阐述，记住就好了。然后就是update刷新函数了。这里我一时没找到刷新函数在哪里调用了，我觉得应该是方法重写，由于继承了Sprite类，猜测update应该是对精灵的刷新函数进行了重写，每次进行精灵刷新的时候就会调用每个精灵中的update函数。`,-1),r(`p`,null,[r(`img`,{src:`/images/2024/11/202411-48bdd907.webp`,alt:``}),r(`img`,{src:`/images/2024/11/202411-db644c2f.webp`,alt:``}),n(`## 写在最后`)],-1),r(`p`,null,[n(`由于本人实力有限，此学习笔记会存在很多不足，只能做到对实例的一个简单过程回忆和剖析，并不能算作一个教程，如果跟着这个笔记走的话，可能要费很大的劲。这里将教学视频链接贴出`),r(`a`,{href:`https://www.bilibili.com/video/BV1ia411d7yW?spm_id_from=333.788.videopod.episodes&vd_source=18d81eba7a49a9cf96b5b4e18a005d7f`,target:`_blank`,rel:`noreferrer`},`https://www.bilibili.com/video/BV1ia411d7yW?spm_id_from=333.788.videopod.episodes&vd_source=18d81eba7a49a9cf96b5b4e18a005d7f`)],-1)]]),"main-header":c(()=>[s(t.$slots,`main-header`)]),"main-header-after":c(()=>[s(t.$slots,`main-header-after`)]),"main-nav":c(()=>[s(t.$slots,`main-nav`)]),"main-content-before":c(()=>[s(t.$slots,`main-content-before`)]),"main-content":c(()=>[s(t.$slots,`main-content`)]),"main-content-after":c(()=>[s(t.$slots,`main-content-after`)]),"main-nav-before":c(()=>[s(t.$slots,`main-nav-before`)]),"main-nav-after":c(()=>[s(t.$slots,`main-nav-after`)]),comment:c(()=>[s(t.$slots,`comment`)]),footer:c(()=>[s(t.$slots,`footer`)]),aside:c(()=>[s(t.$slots,`aside`)]),"aside-custom":c(()=>[s(t.$slots,`aside-custom`)]),default:c(()=>[s(t.$slots,`default`)]),_:3},8,[`frontmatter`])}}};export{f as default};