---
title: 机器学习——逻辑回归项目（1）
date: 2024-12-07
tags:
  - 算法
---

## 数据分析与预处理

当我们拿到一堆数据的时候，首先应该做的是对其进行分析与处理。

```
import pandas as pd
data = pd.read_csv("creditcard.csv")#读取数据
print(data.head())#显示数据,默认前五行
```

这里不建议使用excel开打数据，因为数据一般而言都是成千上万条，打开所需的时间太久了，我们直接使用pandas库来进行读取和显示前五条数据进行一个简单的分析。

![](/images/2024/12/202412-5d235e42.webp)这里我们可以看到这个数据的大概模样，可以得知此数据集一共有31列，其中有30列是特征列，Amount为贷款的金额，Class为分类结果，0为交易正常，1为异常。

接下来我们要检查一下这里面所存在多少异常值。

```
import matplotlib.pyplot as plt
#异常值的找寻
count_classes = pd.value_counts(data['Class'], sort = True).sort_index()
count_classes.plot(kind = 'bar')
plt.title("Fraud class histogram")
plt.xlabel('Class')
plt.ylabel('Frequency')
plt.show()
```

由于数据太多，这里我们使用画图进行数据统计与分析。

value\_counts()是一个计数函数，统计数据的数量。

参数data\['Class'\]指的是统计Class这一列以下的数据。

参数sort是是否进行排序处理。

sort\_index()为引索排序，这里是按照行引索升序排列，使得他们还是从上向下进行排序（0，1，2....)，而非乱序（2，1，0.....）

count\_classes.plot()是画图函数，传入的kind是所需绘图的类型，这里的‘bar’是指绘制条形图

plt.title()绘制图的标题。

plt.xlabel()为x轴坐标的标签，同理ylable即为y轴的标签。

plt.show()将所绘制的图在屏幕上展示出来。

![](/images/2024/12/202412-4fadb3cc.webp)于是乎得到了这一张图，看起来好像没有异常值，其实是有的，只是太少了。

## 特征标准化

![](/images/2024/12/202412-5d235e42.webp)这里我们能看到v1-v28列的数值都是较小的，而amount列的数据相比之下就大的太多了，这样的话，会使得amount在模型中所占的权重过大，但我们并不希望这样，所以我们进行一下数据标准化操作，使模型对他们一视同仁。

![](/images/2024/12/202412-083d24bd.webp)```
from sklearn.preprocessing import StandardScaler
data['normAmount'] = StandardScaler().fit_transform(data["Amount"].values.reshape(-1,1))
data = data.drop(['Time','Amount'],axis=1)
print(data.head())
```

首先导入标准化库，然后使用标准化库中的fit\_transform()函数来进行处理（这个函数先会寻找数据的均值等特征值，然后再进行标准化处理）。

data\['Amount'\]参数指的是我们对Amount这列数据进行处理，后面跟的.values.reshape(-1,1)指的是将Amount列的数据转换成一列数据。

data.drop（）函数用处删除数据，这里我们删除time和amount列，axis=1代表删除的是列

![](/images/2024/12/202412-d42a8f80.webp)这下我们变化后的normAmount就和前面的数据相差无几了。

## 样本不平均的处理方法

这里可以看到我们class为0和为1的数量相差太大，这里有两种解决办法，一为下采样，一为过采样。

## 下采样

假设我们的class为0的样本只有1000个，为1的样本有10000个，那么我们取样的时候，为0的样本取1000个，为1的样本也只取其中的1000。这样就保证了两类数据的比例平均。

## 过采样

这时候我们就增加一些class为0的样本，使其和为1的样本数一样多，怎么增加呢？捏造数据。

## 下采样方案

```
X = data.loc[:, data.columns != 'Class']#读取除Class列之外的所有列
y = data.loc[:, data.columns == "Class"]#读取Class列
number_records_fraud = len(data[data.Class == 1])#统计异常数据数量
fraud_indices = np.array(data[data.Class == 1].index)#将异常值放入数组
normal_indices = data[data.Class == 0].index#储存正常值的索引
random_normal_indices = np.random.choice(normal_indices, number_records_fraud, replace = False)#从正常值引索数组中抽取异常值个数的数为一个新列表，replac = false为不取相同数据
random_normal_indices = np.array(random_normal_indices)#转换为np中的数组
under_sample_indices = np.concatenate([fraud_indices,random_normal_indices])#拼接两个数组
under_sample_data = data.iloc[under_sample_indices,:]#读取这些行的数据
X_undersample = under_sample_data.loc[:, under_sample_data.columns != 'Class']
y_undersample = under_sample_data.loc[:, under_sample_data.columns == "Class"]
print("正常样本所占整体比例：", len(under_sample_data[under_sample_data.Class==0])/len(under_sample_data))
print("异常样本所占整体比例:",len(under_sample_data[under_sample_data.Class == 1])/len(under_sample_data))
print("下采样策略总体样本数量:",len(under_sample_data))
```

data.loc（）函数是读取列表中的数据，参数中第一个：指的是读取全部行。

这里我们将除class列之外的所有数据作为特征值，class列的值作为预测值。

np.random.choice（）函数的第一个参数为从哪一个数组里抽取，第二个为抽取的数量，第三个为是否取相同的数据。

![](/images/2024/12/202412-508b85e4.webp)## 交叉验证

![](/images/2024/12/202412-fa20138d.webp)将训练集划分为多份，每次取其中一份作为验证集，如此下来，对所有的结果取平均，就是模型的评估值。建模的时候有训练集，验证集，测试集。训练集就是用来训练模型的，验证用于验证模型的，测试集用于检测模型成效的。交叉验证就是用于评估检测模型的。

```
#导入数据集切分模块
from sklearn.model_selection import train_test_split
#对于特征值与预测值划分训练集与测试集
X_train, X_test, y_train, y_test = train_test_split(X,y,test_size = 0.3, random_state = 0)
print("\n原始训练集包括样本数量：",len(X_train))
print("原始测试集包含样本数量：", len(X_test))
print("原始样本总数：", len(X_train)+len(X_test))

#下采样数据集进行划分
X_train_undersample,X_test_undersample,y_train_undersample,y_test_undersample = train_test_split(X_undersample, y_undersample, test_size = 0.3, random_state = 0)
print("\n下采样训练集包含样本数量：", len(X_train_undersample))
print("下采样训练测试集包含样本数量：",len(X_test_undersample))
print("下采样样本总数：", len(X_train_undersample)+len(X_test_undersample))
```

train\_test\_split（）函数用于划分训练与测试集，参数为特征值数组，预测值数组，test\_size测试集划分比例，random\_state随机种子。

![](/images/2024/12/202412-15e73fd7.webp)## 模型评估方法

![](/images/2024/12/202412-a835501f.webp)![](/images/2024/12/202412-4e9973fc.webp)## 正则化惩罚

简单而言就是在模型迭代的过程中，不断调整模型的不同参数的占比，以防止出现过拟合现象，使模型的预测效果更好。

![](/images/2024/12/202412-231f605e.webp)a系数是惩罚力度，a越大，惩罚力度越大。

## 逻辑回归模型

```
#逻辑回归模型
from sklearn.model_selection import KFold
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import recall_score
def printing_Kfold_scores(X_train_date, y_train_data):
    fold = KFold(5,shuffle=False)
    #定义不同的正则化惩罚力度
    c_param_range = [0.01,0.1,1,10,100]
    #显示结果用的表格
    results_table = pd.DataFrame(index = range(len(c_param_range),2),columns = ["C_parameter","Mean recall score"])
    results_table["C_parameter"] = c_param_range
    # k-fold 表示K折的交叉验证，这里会得到两个索引集合：训练集 = indices[0]， 验证集 = indices[1]
    j = 0
    #循环遍历不同的参数
    for c_param in c_param_range:
        print('\n---------------------')
        print('正则化惩罚力度：', c_param)
        print('---------------------')
        recall_accs = []
        #一步步分解来执行交叉验证
        for iteration, indices in enumerate(fold.split(y_train_data),start=1):
            #指定算法模型，并且给定参数
            Ir = LogisticRegression(C = c_param, penalty = 'l1',solver='liblinear')
            #训练模型，注意不要给错索引，训练的时候传入的一定是训练集，所以X和Y的索引都是0
            Ir.fit(X_train_date.iloc[indices[0],:],y_train_data.iloc[indices[0],:].values.ravel())
            #建立好模型后，预测模型结果，这里用的就是验证集，索引为1
            y_pred_undersample = Ir.predict(X_train_date.iloc[indices[1],:].values)
            #预测结果明确后，就可以进行评估，这里recall_score需要传入预测值和真实值
            recall_acc = recall_score(y_train_data.iloc[indices[1],:].values,y_pred_undersample)
            #一会还要计算平均，所以吧每一步的结果都先保存起来
            recall_accs.append(recall_acc)
            print('Iteration',iteration,"召回率 = ",recall_acc)
        #当执行完所有的交叉验证之后，计算平均结果
        results_table.loc[j,'Mean recall score'] = np.mean(recall_accs)
        j += 1
        print('')
        print('平均召回率',np.mean(recall_accs))
        print('')
    #找到最好的参数，哪一个Recall高，自然就是最好的
    best_c = results_table.loc[results_table["Mean recall score"].astype('float32').idxmax()]['C_parameter']
    #打印最好的结果
    print("*************************")
    print("效果最好的模型所选参数 = ",best_c)
    print("*************************")
    return best_c
best_c = printing_Kfold_scores(X_train_undersample,y_train_undersample)
```

最后将结果

![](/images/2024/12/202412-3a206c0c.webp)类似于这样，警告自动忽视一下