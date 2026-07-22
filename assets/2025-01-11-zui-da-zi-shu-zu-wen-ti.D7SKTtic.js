import{Bt as e,Ht as t,Q as n,U as r,W as i,er as a,qn as o,qt as s,yn as c}from"./framework.BTQirQJB.js";import{t as l}from"./theme.B62cWSQb.js";import"./chunks/vue-i18n.Dk9JKhVE.js";import{a as u,i as d}from"./chunks/vue-router.SqDC-DRA.js";var f={__name:`2025-01-11-zui-da-zi-shu-zu-wen-ti`,setup(f,{expose:p}){let m=o(JSON.parse(`{"title":"最大子数组问题","description":"","frontmatter":{"title":"最大子数组问题","date":"2025-01-11","tags":["算法"],"firstImage":"/images/2025/01/202501-56f67f74.webp"},"headers":[],"relativePath":"pages/posts/2025-01-11-zui-da-zi-shu-zu-wen-ti.md"}`)),h=u(),g=d(),_=Object.assign(g.meta.frontmatter||{},m.value?.frontmatter||{});return h.currentRoute.value.data=m.value,t(`valaxy:frontmatter`,_),globalThis.$frontmatter=_,p({frontmatter:{title:`最大子数组问题`,date:`2025-01-11`,tags:[`算法`]}}),(t,o)=>{let u=l;return e(),i(u,{frontmatter:a(_)},{"main-content-md":c(()=>[...o[0]||=[r(`p`,null,`本文我们将探讨下如何寻找一个数组的最大子数组。也就是找到其中的一个子数组，该子数组中的全部元素之和最大。前提是这个数组里面的数据有正有负，这样才有价值，不然全是正的很明显就是原本的那个数组。例如A=[2,3,-5,1,-4,6,-2,1],我们要寻找该数组的最大子数组，该如何做呢？这里我们的子数组元素至少为两个，不考虑只含有一个元素的数组。当然你要是愿意的话，也可以拿出来比较一番。`,-1),r(`h2`,{id:`解决思路`,tabindex:`-1`},[n(`解决思路 `),r(`a`,{class:`header-anchor`,href:`#解决思路`,"aria-label":`Permalink to "解决思路"`},`​`)],-1),r(`p`,null,[n(`很直接就能想到的就是，既然你需要比较所有的子数组的元素之和大小，那么我直接遍历它所有的子数组然后找出其中最大的一个。这当然可以，简单粗暴，但是未免太过繁琐了，毕竟你需要执行C`),r(`sup`,null,`2`),r(`sub`,null,`n`),n(` +C`),r(`sub`,null,`n`),r(`sup`,null,`3`),n(` +…+C`),r(`sub`,null,`n`),r(`sup`,null,`n`),n(` 次才能将其子数组给遍历完。`)],-1),r(`p`,null,`这里我们依旧采用前文所阐述过的分治法，用递归的思想将长数组短化，问题简化，直接上图说明。`,-1),r(`p`,null,[r(`img`,{src:`/images/2025/01/202501-56f67f74.webp`,alt:``}),n(`如上图，我们将数组一直二分法划分将数组划分到只剩下一个元素为止，现在我们图中的前两行，如果要寻找到该数组的最大子数组，我们易知最大子数组可能的为止，即要不是位于2，3，-5，1中或-4，6，-2，1中或者是跨过原数组中点，如-5，1，-4，6。那如果我们再往下看一行，2，3，-5，1的最大子数组会在哪里呢？依葫芦画瓢向下推，直到数组中的元素只剩下一个，那么很明显此时的最大子数组就是它自己。接下来我们`),r(`strong`,null,`从下向上看`),n(`，`),r(`strong`,null,`先看2，3分支`),n(`，它的最大子数组既是在2和3和2，3中找寻一个最大子数组并返回回去，很明显是2，3。`),r(`strong`,null,`右边的-5，1部分`),n(`，易知返回的是1，接下来往上看一层，也就是`),r(`strong`,null,`2，3，-5，1`),n(`这层此时左边的2，3返回的子数组是它本身，不变，而右边的-5，1返回的是1，替换掉了-5，1，那么接下来就是在2，3和1和2，3，-5，1中找一个最大的子数组，所以，返回的是2，3这个数组。右边部分同理。最后就能求出来最大子数组了。`)],-1),r(`p`,null,`接下来我们要思考下如何求跨过中点的最大子数组。其实思路也很明确，我们从中点向两边递推，找到最大的左边子数组和右边子数组，最后相加在一起不就得行吗？直接看代码。`,-1),r(`h2`,{id:`代码部分`,tabindex:`-1`},[n(`代码部分 `),r(`a`,{class:`header-anchor`,href:`#代码部分`,"aria-label":`Permalink to "代码部分"`},`​`)],-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`def Find_Max_Subarray_cross_mid(Array):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    high = len(Array)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    low = 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    mid = int((high + low)/2)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    sum = 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    left_sum = float("-inf")`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    left_idex = 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    for x in range(mid,low,-1):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        sum += Array[x-1]`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        if sum > left_sum:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            left_sum = sum`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            left_idex = x-1`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    sum = 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    right_sum = float("-inf")`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    right_idex = 0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    for y in range(mid,high):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        sum += Array[y]`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        if sum > right_sum:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            right_sum = sum`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            right_idex = y`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    cross_sum = left_sum + right_sum`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    return [left_idex,right_idex,cross_sum]`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`在第一块，我们就定下了该数组的左右中三个端点，第二块就是从中点向左端点递推找到最大左子数组，第三块就是从中点向右端点递推找到最大右子数组，由于我们是从中点出发的，所以直接将左右最大子数组相加在一起就可以得到跨过中点的最大子数组了。（代码中的float（“-inf”）是负无穷的意思）`,-1),r(`p`,null,`现在我们能解决跨过中点的最大子数组，左右两边的最大子数组用分治法也能求出，那么就可以看总体代码了。`,-1),r(`div`,{class:`language-`},[r(`button`,{title:`Copy code`,class:`copy`}),r(`span`,{class:`lang`}),r(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[r(`code`,{"v-pre":``},[r(`span`,{class:`line`},[r(`span`,null,`def Find_Max_Subarry(Array,low=0,high=0):`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    low=0`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    high=len(Array)-1`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    if low == high:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        return [low,high,Array[0]]`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`    else:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        mid = int((low+high)/2)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        left_max_array = Find_Max_Subarry(Array[0:mid],low,mid)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        right_max_array = Find_Max_Subarry(Array[mid:high],mid,high)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        cross_max_array = Find_Max_Subarray_cross_mid(Array)`)]),n(`
`),r(`span`,{class:`line`},[r(`span`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        if left_max_array[2] >= right_max_array[2] and left_max_array[2] >= cross_max_array[2]:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            return left_max_array`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        elif right_max_array[2] >= left_max_array[2] and right_max_array[2] >= cross_max_array[2]:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            return right_max_array`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`        else:`)]),n(`
`),r(`span`,{class:`line`},[r(`span`,null,`            return cross_max_array`)])])]),r(`button`,{class:`code-block-unfold-btn`})],-1),r(`p`,null,`此函数接受数组和其上下标，第一部分就是考虑数组中只剩下一个元素的情况，此时我们将其本身返回回去，第二部分，就是分别计算其最大左子数组，最大右子数组，和跨过中点的最大子数组，最后将其中最大的返回即可。`,-1),r(`h2`,{id:`写在最后`,tabindex:`-1`},[n(`写在最后 `),r(`a`,{class:`header-anchor`,href:`#写在最后`,"aria-label":`Permalink to "写在最后"`},`​`)],-1),r(`p`,null,`上文中的代码是有些问题的，例如会出现栈溢出的情况，还有，原本Find_Max_Subarry函数我也是只接收一个Array参数，并不接收上下标，但是却会出现返回只有单一元素的最大子数组，这不是我们所期望的，但是加了上下标的接收，反而不会出现这样的问题了（现在好像也有？）。这些问题就当作思考题交给富有聪明才智的你去解决了。`,-1)]]),"main-header":c(()=>[s(t.$slots,`main-header`)]),"main-header-after":c(()=>[s(t.$slots,`main-header-after`)]),"main-nav":c(()=>[s(t.$slots,`main-nav`)]),"main-content-before":c(()=>[s(t.$slots,`main-content-before`)]),"main-content":c(()=>[s(t.$slots,`main-content`)]),"main-content-after":c(()=>[s(t.$slots,`main-content-after`)]),"main-nav-before":c(()=>[s(t.$slots,`main-nav-before`)]),"main-nav-after":c(()=>[s(t.$slots,`main-nav-after`)]),comment:c(()=>[s(t.$slots,`comment`)]),footer:c(()=>[s(t.$slots,`footer`)]),aside:c(()=>[s(t.$slots,`aside`)]),"aside-custom":c(()=>[s(t.$slots,`aside-custom`)]),default:c(()=>[s(t.$slots,`default`)]),_:3},8,[`frontmatter`])}}};export{f as default};