import{$ as e,G as t,Jn as n,Jt as r,Ut as i,Vt as a,W as o,bn as s,tr as c}from"./framework.CjdSPkFv.js";import{n as l}from"./theme.Dt3khUt3.js";import"./reka-ui.CVRMFFNl.js";import{c as u,l as d}from"./chunks/vue-router.8e84d6cC.js";var f=`/assets/1736563409-%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2025-01-11-104320-1024x524.BLo6e30m.png`,p={__name:`最大子数组问题`,setup(p,{expose:m}){let h=n(JSON.parse(`{"title":"最大子数组问题","description":"","frontmatter":{"title":"最大子数组问题","date":"2025-01-11 11:51:18","categories":"未分类","tags":["算法"],"ogImage":"/og/default.png"},"headers":[{"level":2,"title":"解决思路","slug":"解决思路","link":"#解决思路","children":[]},{"level":2,"title":"代码部分","slug":"代码部分","link":"#代码部分","children":[]},{"level":2,"title":"写在最后","slug":"写在最后","link":"#写在最后","children":[]}],"relativePath":"pages/posts/最大子数组问题.md","lastUpdated":1794066059000}`)),g=d(),_=u(),v=Object.assign(_.meta.frontmatter||{},h.value?.frontmatter||{});return g.currentRoute.value.data=h.value,i(`valaxy:frontmatter`,v),globalThis.$frontmatter=v,m({frontmatter:{title:`最大子数组问题`,date:`2025-01-11 11:51:18`,categories:`未分类`,tags:[`算法`],ogImage:`/og/default.png`}}),(n,i)=>{let u=l;return a(),t(u,{frontmatter:c(v)},{"main-content-md":s(()=>[...i[0]||=[o(`p`,null,`本文我们将探讨下如何寻找一个数组的最大子数组。也就是找到其中的一个子数组，该子数组中的全部元素之和最大。前提是这个数组里面的数据有正有负，这样才有价值，不然全是正的很明显就是原本的那个数组。例如A=[2,3,-5,1,-4,6,-2,1],我们要寻找该数组的最大子数组，该如何做呢？这里我们的子数组元素至少为两个，不考虑只含有一个元素的数组。当然你要是愿意的话，也可以拿出来比较一番。`,-1),o(`h2`,{id:`解决思路`,tabindex:`-1`},[e(`解决思路 `),o(`a`,{class:`header-anchor`,href:`#解决思路`,"aria-label":`Permalink to "解决思路"`},`​`)],-1),o(`p`,null,`很直接就能想到的就是，既然你需要比较所有的子数组的元素之和大小，那么我直接遍历它所有的子数组然后找出其中最大的一个。这当然可以，简单粗暴，但是未免太过繁琐了，毕竟你需要执行C2n +Cn3 +…+Cnn 次才能将其子数组给遍历完。`,-1),o(`p`,null,`这里我们依旧采用前文所阐述过的分治法，用递归的思想将长数组短化，问题简化，直接上图说明。`,-1),o(`figure`,null,[o(`img`,{src:f,alt:``,loading:`lazy`,decoding:`async`})],-1),o(`p`,null,[e(`如上图，我们将数组一直二分法划分将数组划分到只剩下一个元素为止，现在我们图中的前两行，如果要寻找到该数组的最大子数组，我们易知最大子数组可能的为止，即要不是位于2，3，-5，1中或-4，6，-2，1中或者是跨过原数组中点，如-5，1，-4，6。那如果我们再往下看一行，2，3，-5，1的最大子数组会在哪里呢？依葫芦画瓢向下推，直到数组中的元素只剩下一个，那么很明显此时的最大子数组就是它自己。接下来我们`),o(`strong`,null,`从下向上看`),e(`，`),o(`strong`,null,`先看2，3分支`),e(`，它的最大子数组既是在2和3和2，3中找寻一个最大子数组并返回回去，很明显是2，3。`),o(`strong`,null,`右边的-5，1部分`),e(`，易知返回的是1，接下来往上看一层，也就是`),o(`strong`,null,`2，3，-5，1`),e(`这层此时左边的2，3返回的子数组是它本身，不变，而右边的-5，1返回的是1，替换掉了-5，1，那么接下来就是在2，3和1和2，3，-5，1中找一个最大的子数组，所以，返回的是2，3这个数组。右边部分同理。最后就能求出来最大子数组了。`)],-1),o(`p`,null,`接下来我们要思考下如何求跨过中点的最大子数组。其实思路也很明确，我们从中点向两边递推，找到最大的左边子数组和右边子数组，最后相加在一起不就得行吗？直接看代码。`,-1),o(`h2`,{id:`代码部分`,tabindex:`-1`},[e(`代码部分 `),o(`a`,{class:`header-anchor`,href:`#代码部分`,"aria-label":`Permalink to "代码部分"`},`​`)],-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`def Find_Max_Subarray_cross_mid(Array):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    high = len(Array)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    low = 0`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    mid = int((high + low)/2)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    sum = 0`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    left_sum = float("-inf")`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    left_idex = 0`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    for x in range(mid,low,-1):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        sum += Array[x-1]`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        if sum > left_sum:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            left_sum = sum`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            left_idex = x-1`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    sum = 0`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    right_sum = float("-inf")`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    right_idex = 0`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    for y in range(mid,high):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        sum += Array[y]`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        if sum > right_sum:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            right_sum = sum`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            right_idex = y`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    cross_sum = left_sum + right_sum`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    return [left_idex,right_idex,cross_sum]`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`在第一块，我们就定下了该数组的左右中三个端点，第二块就是从中点向左端点递推找到最大左子数组，第三块就是从中点向右端点递推找到最大右子数组，由于我们是从中点出发的，所以直接将左右最大子数组相加在一起就可以得到跨过中点的最大子数组了。（代码中的float（“-inf”）是负无穷的意思）`,-1),o(`p`,null,`现在我们能解决跨过中点的最大子数组，左右两边的最大子数组用分治法也能求出，那么就可以看总体代码了。`,-1),o(`div`,{class:`language-`},[o(`button`,{title:`Copy code`,class:`copy`}),o(`span`,{class:`lang`}),o(`pre`,{class:`shiki shiki-themes github-light github-dark vp-code`},[o(`code`,{"v-pre":``},[o(`span`,{class:`line`},[o(`span`,null,`def Find_Max_Subarry(Array,low=0,high=0):`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    low=0`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    high=len(Array)-1`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    if low == high:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        return [low,high,Array[0]]`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`    else:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        mid = int((low+high)/2)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        left_max_array = Find_Max_Subarry(Array[0:mid],low,mid)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        right_max_array = Find_Max_Subarry(Array[mid:high],mid,high)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        cross_max_array = Find_Max_Subarray_cross_mid(Array)`)]),e(`
`),o(`span`,{class:`line`},[o(`span`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        if left_max_array[2] >= right_max_array[2] and left_max_array[2] >= cross_max_array[2]:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            return left_max_array`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        elif right_max_array[2] >= left_max_array[2] and right_max_array[2] >= cross_max_array[2]:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            return right_max_array`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`        else:`)]),e(`
`),o(`span`,{class:`line`},[o(`span`,null,`            return cross_max_array`)])])]),o(`button`,{class:`code-block-unfold-btn`})],-1),o(`p`,null,`此函数接受数组和其上下标，第一部分就是考虑数组中只剩下一个元素的情况，此时我们将其本身返回回去，第二部分，就是分别计算其最大左子数组，最大右子数组，和跨过中点的最大子数组，最后将其中最大的返回即可。`,-1),o(`h2`,{id:`写在最后`,tabindex:`-1`},[e(`写在最后 `),o(`a`,{class:`header-anchor`,href:`#写在最后`,"aria-label":`Permalink to "写在最后"`},`​`)],-1),o(`p`,null,`上文中的代码是有些问题的，例如会出现栈溢出的情况，还有，原本Find_Max_Subarry函数我也是只接收一个Array参数，并不接收上下标，但是却会出现返回只有单一元素的最大子数组，这不是我们所期望的，但是加了上下标的接收，反而不会出现这样的问题了（现在好像也有？）。这些问题就当作思考题交给富有聪明才智的你去解决了。`,-1)]]),main:s(()=>[r(n.$slots,`main`)]),"main-header":s(()=>[r(n.$slots,`main-header`)]),"main-header-after":s(()=>[r(n.$slots,`main-header-after`)]),"main-nav":s(()=>[r(n.$slots,`main-nav`)]),"main-content-before":s(()=>[r(n.$slots,`main-content-before`)]),"main-content":s(()=>[r(n.$slots,`main-content`)]),"main-content-after":s(()=>[r(n.$slots,`main-content-after`)]),"main-nav-before":s(()=>[r(n.$slots,`main-nav-before`)]),"main-nav-after":s(()=>[r(n.$slots,`main-nav-after`)]),comment:s(()=>[r(n.$slots,`comment`)]),footer:s(()=>[r(n.$slots,`footer`)]),aside:s(()=>[r(n.$slots,`aside`)]),"aside-custom":s(()=>[r(n.$slots,`aside-custom`)]),default:s(()=>[r(n.$slots,`default`)]),_:3},8,[`frontmatter`])}}};export{p as default};