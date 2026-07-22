import{Bt as e,Ht as t,Q as n,U as r,W as i,er as a,qn as o,qt as s,yn as c}from"./framework.BTQirQJB.js";import{t as l}from"./theme.B62cWSQb.js";import"./chunks/vue-i18n.Dk9JKhVE.js";import{a as u,i as d}from"./chunks/vue-router.SqDC-DRA.js";var f={__name:`2024-11-17-pygame-xue-xi-bi-ji-3`,setup(f,{expose:p}){let m=o(JSON.parse(`{"title":"Pygame学习笔记(3)","description":"","frontmatter":{"title":"Pygame学习笔记(3)","date":"2024-11-17","tags":["算法"]},"headers":[],"relativePath":"pages/posts/2024-11-17-pygame-xue-xi-bi-ji-3.md"}`)),h=u(),g=d(),_=Object.assign(g.meta.frontmatter||{},m.value?.frontmatter||{});return h.currentRoute.value.data=m.value,t(`valaxy:frontmatter`,_),globalThis.$frontmatter=_,p({frontmatter:{title:`Pygame学习笔记(3)`,date:`2024-11-17`,tags:[`算法`]}}),(t,o)=>{let u=l;return e(),i(u,{frontmatter:a(_)},{"main-content-md":c(()=>[...o[0]||=[r(`h2`,{id:`让角色使用道具`,tabindex:`-1`},[n(`让角色使用道具 `),r(`a`,{class:`header-anchor`,href:`#让角色使用道具`,"aria-label":`Permalink to "让角色使用道具"`},`​`)],-1),r(`p`,null,`在输入控制方法中添加一个空格键监测，让我们在按下空格键的时候可以播放玩家使用工具的动画。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`if keys[pygame.K_SPACE]:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    self.tool_use = True`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    self.tool = axe`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`在我们的状态获取方法中将状态更改为对应的使用工具的状态`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`if self.tool_use:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    self.status = self.status.split('_')[0] + '_' + self.tool`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`这样在我们按下空格键的时候就可以播放使用斧头的动画了（脑补动画）`,-1),r(`p`,null,`但是现在我们会一直挥动斧头不会停止，所以我们需要添加一个计时器来控制使用工具时的动画播放时间。让我们新建一个timer.py文件，写一个简单的计时器。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`import pygame`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`class Timer:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def __init__(self,duration,func = None):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.duration = duration`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.func = func`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.start_time = 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.active = False`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def activate(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.active = True`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.start_time = pygame.time.get_ticks()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def deactivate(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.active = False`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.start_time = 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def update(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        current_time = pygame.time.get_ticks()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        if current_time - self.start_time >= self.duration:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            self.deactivate()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            if self.func:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                self.func()`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`在这里我们创建了一个计时器类，它接收时间和一个方法，可以在记时结束的时候进行这个方法的调用。在activate方法中，我们对计时器进行激活，并记录下激活时的时间，在deactivate方法中我们将计时器关闭并重置开始的时间，在update函数中我们记录每次调用此方法时的时间，如果现在的时间减去开始的时间大于等于我们传入的时间预设值的时候，我们将计时器关闭，并执行传入的方法。`,-1),r(`p`,null,`回到player文件中，我们创建一个计时器的字典用来储存我们即将创建的计时器实例。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`self.timers = {`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            'tool use': Timer(350,self.use_tool),`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        }`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`这里有个use_tool方法传入，我们暂且先创建一个空方法在player中为后续做准备，现在我们可以暂且不用管它。现在回到我们的input方法中，对按键的监测进行一些更改。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`if keys[pygame.K_SPACE]:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    self.timers['tool use'].activate()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    self.direction = pygame.math.Vector2()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    self.frame_index = 0`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`当我们按下空格键的时候我们启动计时器，并将玩家的运动向量重置为零，以防止玩家边跑边使用工具，同时我们将图片的引索值归为零以确保我们的动画从头开时播放。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`def update_timers(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        for timer in self.timers.values():`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            timer.update()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`def update(self, dt):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.input()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.get_status()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.update_timers()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.move(dt)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.animate(dt)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`接下来我们定义一个计时器的刷新方法来在player中时刻更新计时器，同时在update方法中调用此刷新。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`    def get_status(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        if self.direction.magnitude() == 0:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            self.status = self.status.split('_')[0] + "_idle"`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        if self.timers['tool use'].active:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            self.status = self.status.split('_')[0] + '_axe'`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`在状态获取方法中我们对计时器的激活状态进行监测，如果处于激活状态我们就将状态改为使用工具的状态，这样我们就可以正常使用工具。（动画脑补）`,-1),r(`h2`,{id:`工具的切换`,tabindex:`-1`},[n(`工具的切换 `),r(`a`,{class:`header-anchor`,href:`#工具的切换`,"aria-label":`Permalink to "工具的切换"`},`​`)],-1),r(`p`,null,`在素材中我们准备了三种工具，所以我们接下来要能够实现让玩家可以自主地切换使用工具。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`        self.tools = ['hoe','axe','water']`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.tool_index = 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.select_tool = self.tools[self.tool_index]`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`回到player的初始化器中，我们添加一个列表来存贮我们的三个工具，并且通过列表的访问来调出使用的工具。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`            if keys[pygame.K_q] :`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                self.tool_index += 1`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                self.tool_index = self.tool_index if self.tool_index < len(self.tools) else 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                self.select_tool = self.tools[self.tool_index]`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`在input方法中我们添加对q键的监测，使得用户在按下q键的时候可以对工具的选择进行切换，并给引索值进行一些判断以防止它超过我们列表的范围而报错，接下来我们就可以把状态更新中的“_axe”改为+ “_” + self.select_tool来更新状态了，这样我们就可以使用不同的工具了。（动画脑补）`,-1),r(`p`,null,`我们可以给我们的工具切换增加个计时器来限制玩家过于频繁切换工具`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`'tool switch': Timer(200)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`...`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`if keys[pygame.K_q] and not self.timers['tool switch'].active:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                self.timers['tool switch'].activate()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                self.tool_index += 1`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                self.tool_index = self.tool_index if self.tool_index < len(self.tools) else 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                self.select_tool = self.tools[self.tool_index]`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`在计时器字典中我们添加一个工具切换的计时器，它在结束时并不需要执行什么方法，并在监测按键的时候增加一个条件使得它只有在计时器不处于激活状态的时候执行下文语句。`,-1),r(`h2`,{id:`工具图标的显示`,tabindex:`-1`},[n(`工具图标的显示 `),r(`a`,{class:`header-anchor`,href:`#工具图标的显示`,"aria-label":`Permalink to "工具图标的显示"`},`​`)],-1),r(`p`,null,`为了让玩家能够清楚的知道当前是在使用什么工具，我们可以将当前选择的工具图标显示在屏幕中。为此我们新建一个overlay.py来单独管理。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`import pygame`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`from settings import *`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`class Overlay:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def __init__(self,player):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        #general setup`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.display_surface = pygame.display.get_surface()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.player = player`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        #imports`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        overlay_path = '../graphics/overlay/'`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.tools_surf = {tool:pygame.image.load(f'{overlay_path}{tool}.png').convert_alpha() for tool in player.tools}`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`     `)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def display(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        #tool`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        tool_surf = self.tools_surf[self.player.select_tool]`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        tool_rect = tool_surf.get_rect(midbottom = OVERLAY_POSITIONS['tool'])`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.display_surface.blit(tool_surf,tool_rect)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`这和level中的设置都是大同小异，先获取当前的表面，同时获取我们player中的工具状态，所以我们需要传入player，后面按照常规将我们的图像导入并绘出在预设位置上。接下来我们回到level中调用此方法即可。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`self.overlay = Overlay(self.player)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`......`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,` def run(self,dt):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.display_surface.fill("black")`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.all_sprites.draw(self.display_surface)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.all_sprites.update(dt)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.overlay.display()`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`如此以来我们就可以将当前工具的图标显示屏幕的左下角了。（脑补画面）后面还有种子的选择与使用，依葫芦画瓢即可。`,-1),r(`h2`,{id:`绘制背景`,tabindex:`-1`},[n(`绘制背景 `),r(`a`,{class:`header-anchor`,href:`#绘制背景`,"aria-label":`Permalink to "绘制背景"`},`​`)],-1),r(`p`,null,`当前我们的主角还处于一片虚无中，让我们给他创建一个背景。并使得画面能够随着角色的移动而移动，我们新建一个sprites.py来管理。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`import pygame`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`from settings import *`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`class Generic(pygame.sprite.Sprite):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def __init__(self,pos,surf,groups):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        super().__init__(groups)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.image = surf`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.rect = self.image.get_rect(topleft = pos)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`我们回到level中调用此方法。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`    def setup(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        Generic(`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            pos = (0,0),`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            surf = pygame.image.load("../graphics/world/ground.png").convert_alpha(),`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            groups = self.all_sprites)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.player = Player((640,360),self.all_sprites)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`将我们的背景创建并添加到精灵组中。接下来我们就能够显示出背景来了。（画面脑补）`,-1),r(`h2`,{id:`添加相机`,tabindex:`-1`},[n(`添加相机 `),r(`a`,{class:`header-anchor`,href:`#添加相机`,"aria-label":`Permalink to "添加相机"`},`​`)],-1),r(`p`,null,`现在的状态是只有玩家会动，地图处于一个静止状态，我们添加个相机来实现地图的移动。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`import pygame`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`from settings import *`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`class Generic(pygame.sprite.Sprite):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`def init(self,pos,surf,groups, z = LAYERS['main']):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`super().init(groups)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`self.image = surf`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`self.rect = self.image.get_rect(topleft = pos)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`self.z = z`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`我们先给我们的画图添加个z轴来确保每个元素出现在它该出现的位置上。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`class CameraGroup(pygame.sprite.Group):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def __init__(self):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        super().__init__()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.display_surface = pygame.display.get_surface()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.offset = pygame.math.Vector2()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    def custom_draw(self,player):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.offset.x = player.rect.centerx - SCREEN_WIDTH / 2`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.offset.y = player.rect.centery - SCREEN_HEIGHT / 2`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        for layer in LAYERS.values():`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            for sprite in self.sprites():`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                if sprite.z == layer:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                    offset_rect = sprite.rect.copy()`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                    offset_rect.center -= self.offset`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`                    self.display_surface.blit(sprite.image, offset_rect)`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`先获取当前表面，同时创建一个新的向量来存贮，在custom_draw方法中，我们接收player并将摄像机固定在其上，计算出地图绘图所需要的偏移量（其实就是玩家移动的偏移量移交给地图），遍历LAYWES层，使得每个图案在其对应的层上，也就是z轴。获取每个精灵的矩形，将矩形的中心位置进行更新，再进行绘画`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`    def run(self,dt):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.display_surface.fill("black")`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        #self.all_sprites.draw(self.display_surface)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.all_sprites.custom_draw(self.player)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.all_sprites.update(dt)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        self.overlay.display()`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`在run方法中调用custom_draw()方法既可以确保每个图像在其该在的位置同时确保player在中心，让地图随着角色的运动而运动。（动画脑补）`,-1)]]),"main-header":c(()=>[s(t.$slots,`main-header`)]),"main-header-after":c(()=>[s(t.$slots,`main-header-after`)]),"main-nav":c(()=>[s(t.$slots,`main-nav`)]),"main-content-before":c(()=>[s(t.$slots,`main-content-before`)]),"main-content":c(()=>[s(t.$slots,`main-content`)]),"main-content-after":c(()=>[s(t.$slots,`main-content-after`)]),"main-nav-before":c(()=>[s(t.$slots,`main-nav-before`)]),"main-nav-after":c(()=>[s(t.$slots,`main-nav-after`)]),comment:c(()=>[s(t.$slots,`comment`)]),footer:c(()=>[s(t.$slots,`footer`)]),aside:c(()=>[s(t.$slots,`aside`)]),"aside-custom":c(()=>[s(t.$slots,`aside-custom`)]),default:c(()=>[s(t.$slots,`default`)]),_:3},8,[`frontmatter`])}}};export{f as default};