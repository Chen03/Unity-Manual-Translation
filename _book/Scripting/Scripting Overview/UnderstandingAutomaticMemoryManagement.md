# 理解自动内存管理 Understanding Automatic Memory Management

当一个对象、字符串或者数组被创建的时候，用来储存的内存从一个叫做**堆**的中心池分配。当物品不再需要的时候，他占用的内存可以重新分配来用作他用。在过去，这些任务完全由程序员来完成，通过正确地调用方法来精确地分配和释放内粗。如今，像 Unity 的 Mono 引擎这样的运行时系统可以为你自动地管理内存。自动内存管理比起精确地分配/释放需要更少的精力来码代码，并且可以大大减少潜在的内存泄漏（被分配的内存永远不会释放的情况）。

## 值和引用类型 Value and Reference Types

当一个方法被调用，它的参数的值会复制去一个保留的内存区域提供给那个特定的调用。传统数据类型只占用很少的字节并且可以非常快和简单地被复制。但是，对于对象、字符串和数组，他们常常占用大得多的内存，并且如果要复制他们会非常低效。幸运的是，这没必要；实际上储存这些大的东西的位置是从堆中分配的内存以及一个小“指针”值用来记住他的位置。从这时起，只有这个指针在传参过程中需要被复制。因为运行时系统可以通过指针定位这些东西，一份数据的复制可以尽可能地频繁使用。

在传参过程中可以直接储存和使用的值叫做数据类型。这包括整形，浮点值，布尔和 Unity 的结构体类型（比如 **Color** 和 **Vector3**）。被分配到堆里并通过指针访问的类型叫引用类型，因为这些储存在变量里的值只是“引用”到了真实的值。引用类型的例子有对象、字符串和数组。

## 分配和垃圾回收 Allocation and Garabge Collection

内存管理器保持对堆中的空间进行跟踪以确保他清楚哪些空间可以用。当有一块新的内存需求的时候（比如有个对象要被实例化了），管理器选择一块没有使用的空间，用来分配内存并把这块内存移出未使用区域。以后的需求也是以同样的方式处理，直到已经没有足够大的空间来分配内存。在这时所有在堆中分配的内存不可能还全部在使用中。一个在堆中被引用的东西只能在还有引用值存在的时候被引用。如果对一个内存块所有的引用都丢失了（比如引用值被重新分配或者是超出范围的局部变量）那么他占用的这一块内存可以被安全地重新分配。

为了弄清楚那一块堆块不再需要被使用，内存管理器会遍历所有激活的引用值并标记他们引用到的块为“活动”。在搜索结束时，任何活动块之间的空间会被内存管理器认为是空闲的，并可以用作随后的内存分配。显而易见的，定位和释放无用内存的过程被称作垃圾回收。

Uinty 使用 [Boehm–Demers–Weiser garbage collector](https://www.hboehm.info/gc/)，一个停止世界（？）的垃圾回收器。无论何时 Unity 需要进行垃圾回收，他会停止运行你的代码并只在结束他的工作之后恢复。这个中断会导致你游戏的执行在任何地方都产生从少于1毫秒到几百毫秒的延迟，这取决于垃圾回收器要处理多少内存和游戏运行的平台。对于与现实时间同步的程序像是游戏，这会造成大问题，因为你在垃圾回收器中断游戏执行的时候不能保持稳定的帧率来使动画平滑。这些中断被称为 GC(垃圾回收) spikes(钉子)（卡顿），因为他们在 Profiler(分析器) 帧时间图形中显示得像钉子一样。在下一部分你会学到如何写代码来避免游戏过程中不必要的通过垃圾回收的内存分配，以使垃圾回收器有更少的工作要做。

## 优化 Optimization

垃圾回收对于程序员来说是自动和不可见的，但是回收过程实际上在场景背后占用了显著的 CPU 时间。当使用恰当，自动垃圾回收管理一般可以在所有表现中等价或者超过人工分配。但是，对于程序员很重要的一点是避免会导致不必要地频繁触发回收器并导致运行终端的错误。

这里有一些不出名的算法，他们可以导致 GC 的噩梦，甚至第一眼看上他们是无辜的（粉切黑QvQ）。重复字符串连接是一个经典的例子：

```cs
//C# script example
using UnityEngine;
using System.Collections;

public class ExampleScript : MonoBehaviour {
    void ConcatExample(int[] intArray) {
        string line = intArray[0].ToString();
        
        for (i = 1; i < intArray.Length; i++) {
            line += ", " + intArray[i].ToString();
        }
        
        return line;
    }
}
```

这里的关键点是新的片段不会加到已有的后面，一个接一个。真正发生的是每一次循环，之前的行内容被丢弃了——一个完整的字符串被分配来包含之前的内容再在末尾加上新的片段。随着 `i` 的增长字符串越变越长，堆空间的使用量约会越来越多，而每次方法调用都会轻易的花掉数百字节的空间。如果你需要把许多字符串连接到一起，一个更好的选择是使用 Mono 库的 [System.Text.StringBuilder](http://msdn.microsoft.com/en-gb/library/system.text.stringbuilder.aspx) 类。

然而，甚至重复的链接不会引起太多问题，如果他不被频繁调用，而“频繁调用”在 Unity 中经常意味着帧更新。像这样：

```cs
//C# script example
using UnityEngine;
using System.Collections;

public class ExampleScript : MonoBehaviour {
    public GUIText scoreBoard;
    public int score;
    
    void Update() {
        string scoreText = "Score: " + score.ToString();
        scoreBoard.text = scoreText;
    }
}
```

会在每次 Update 方法被调用的时候分配新字符串空间并产生细水长流的垃圾。大多数空间都可以通过只在分数变更的时候才更新的方式来节约：

```cs
//C# script example
using UnityEngine;
using System.Collections;

public class ExampleScript : MonoBehaviour {
    public GUIText scoreBoard;
    public string scoreText;
    public int score;
    public int oldScore;
    
    void Update() {
        if (score != oldScore) {
            scoreText = "Score: " + score.ToString();
            scoreBoard.text = scoreText;
            oldScore = score;
        }
    }
}
```

当一个方法返回数组的时候会触发另一个潜在的问题：

```cs
//C# script example
using UnityEngine;
using System.Collections;

public class ExampleScript : MonoBehaviour {
    float[] RandomList(int numElements) {
        var result = new float[numElements];
        
        for (int i = 0; i < numElements; i++) {
            result[i] = Random.value;
        }
        
        return result;
    }
}
```

这类型的函数在创建一个被数值填充的新数组的时候十分优雅和方便。但是，如果它被调用地太频繁，那么新释放的内存每一次都会被分配。因为数组可以变得非常大，新的堆空间可以被非常快地使用掉，而这反映在频繁的垃圾回收上。一个避免这个问题的方式是利用数组是引用类型这个事实。一个通过参数传递到方法的数组可以在那个方法中被修改，并且结果会在方法返回后被保留。一个向上面那样的方法常常可以被像这样的东西取代：

```cs
//C# script example
using UnityEngine;
using System.Collections;

public class ExampleScript : MonoBehaviour {
    void RandomList(float[] arrayToFill) {
        for (int i = 0; i < arrayToFill.Length; i++) {
            arrayToFill[i] = Random.value;
        }
    }
}
```

这简单地用新数值重新填充了已有数组的数值。尽管这需要在调用函数的代码中初始化分配数组（看起来一点也不优雅），函数在调用时不会产生任何垃圾。

## 关闭垃圾分类 Disabling garbage collection

如果你在使用 Mono 或者 **IL2CPP** **scripting backend**(脚本后端)，你可以通过在运行时关闭垃圾回收来避免 CPU 卡顿。当你关闭垃圾回收，内存使用永远不会降低因为垃圾回收器不再回收不再有任何引用的对象。事实上，内存使用在你关闭垃圾回收器之后只能一直攀升。为了避免过长时间占用太多内存，要注意管理内存。理想情况下，在垃圾管理器关闭前分配好所有的内存并避免更多的分配当他关闭之后。

获取更多关于如何在运行时启用和关闭垃圾回收的细节，查看 [GarbageCollector](https://docs.unity3d.com/ScriptReference/Scripting.GarbageCollector.html) 编程 API 页面。

你也可以尝试 [Incremental garbage collection option](https://docs.unity3d.com/Manual/UnderstandingAutomaticMemoryManagement.html#incremental_gc)。

## 请求一次回收 Requesting a Collection

向上面提到的那样，最好尽可能地避免内存分配。然而，考虑到它们不可能被完全消除，你可以使用两种主要策略来最小化它们对游戏的干扰。

### 拥有迅速和频繁垃圾回收的小堆

这种策略最适用于拥有长时间的过程而帧率是重中之重的游戏。这种游戏常常频繁地申请小块的内存但这些小块只会短暂地被使用。使用这种策略的经典堆大小在 **iOS** 上大约是 200KB，并且垃圾回收在 iPhone 3G 上大约会花费 5ms。如果堆大小增至 1M，垃圾回收会花费 7ms。因此定期在帧之间请求垃圾回收会有优势。这常常会使垃圾回收发生得比严格需求更频繁，但是他会迅速处理完毕并对游戏产生最小的影响：

```cs
if (Time.frameCount % 30 == 0)
{
   System.GC.Collect();
}
```

然而，你应该谨慎地使用这个技术并检查 profiler(分析器) 的状态来确保真的减少了你的游戏的回收时间。

### 拥有慢但是不频繁的垃圾回收的大堆

这个策略最适用于申请内存（因此回收也是）相当不频繁并可以在游戏暂停时被处理。堆在不会被系统因为占用内存过高而被杀死的前提下越大越好。然而，Mono 运行时会避免拓展堆空间，尽管完全可以。你可以通过在启动时预分配一些占位空间来手动拓展堆空间（比如你可以实例化一个“没用”的对象来仅仅利用它对内存管理器的影响）：

```cs
//C# script example
using UnityEngine;
using System.Collections;

public class ExampleScript : MonoBehaviour {
    void Start() {
        var tmp = new System.Object[1024];
        
        // make allocations in smaller blocks to avoid them to be treated in a special way, which is designed for large blocks
        for (int i = 0; i < 1024; i++)
            tmp[i] = new byte[1024];
        
        // release reference
        tmp = null;
    }
}
```

一个足够大的堆在两次暂停之间不应该被占用至必须回收。当这样的暂停发生时，你可以显式地请求一次回收：

```cs
System.GC.Collect();
```

一样的，你应该谨慎地使用这个策略并注意 profiler(分析器) 状态而不是假设它发挥了预期的作用。

## 可重用对象池 Reusable Object Pools

在很多情况下你可以简单地通过减少对象的创建和销毁来避免产生垃圾。有很多特定种类的对象，像子弹，会在游戏中重复遇见，尽管只有很小一部分会显示出来。像这样的情况，比起创建旧的并用新的替换掉，重用他们总是可能的。

# 逐步垃圾回收 Incremental Garabge Collection

**注意：** 这是一个预览功能并且容易被更改。任何使用了这个功能的项目可能需要在未来的更新中升级。不要在完整的产品中依赖这个功能直到这个功能正式发布。

*Incremental Garbage Collection*(逐步垃圾回收) 把要进行的工作分发来使垃圾回收在多个帧中进行。

使用逐步垃圾回收，Unity 仍然使用 Boehm–Demers–Weiser 垃圾回收器，但在逐步模式中运行它。比起在每次运行它时做一次完全的垃圾回收，Unity 把垃圾回收负载分散在多个帧中。所以比起通过一次你的程序的长中断来让垃圾回收器完成他的工作，你会得到多次但大大缩短的中断。尽管这完全不能让垃圾回收快一丁点，这还是可以显著的减少垃圾回收的卡顿破坏你的游戏的顺滑，通过把负载分散到几个帧的方式。

接下来来自 Unity 分析器的截图，有和没有足部垃圾回收，表现了逐步垃圾回收如何减少帧率卡顿。在这些分析器图形中，淡蓝色部分表示了脚本操作的时间，黄色部分表示了在 Vsync（等待下一帧开始）之前的剩余时间，而深绿色（明明是深黄褐色）部分表示了垃圾回收的时间。

![Nonincremental garbage collection profile](https://docs.unity3d.com/uploads/Main/gc_spike.png)
*Nonincremental garbage collection profile*

不包含逐步垃圾回收（上面这个），你可以看见卡顿中断了其他地方顺滑的 60fps 帧率。这次卡顿使垃圾回收发生的那一帧推迟了远超过 16 毫秒，而这是保持 60fps 的限制。（实际上，这个例子因为垃圾回收影响了超过一帧）

![Incremental garbage collection profile](https://docs.unity3d.com/uploads/Main/gc_auto.png)
*Incremental garbage collection profile*

使用逐步垃圾回收（上面），相同的项目保持了他的恒定的 60fps 帧率，因为垃圾回收操作分割在了几个帧里，而每一帧只用了短暂的时间（深绿色区域刚刚好在黄色的 Vsync 图像上）。

![Incremental garbage collection using left over time in frame](https://docs.unity3d.com/uploads/Main/gc_incremental.png)
*Incremental garbage collection using left over time in frame*

这个截图表示了相同的也有逐步垃圾回收的项目，但这一次每帧的脚本运行时间更短。同样，垃圾回收操作被分散到几个帧里。不同的是这一次，垃圾回收每帧消耗了更多的时间，并且需要更少的总帧数来完成。这是因为我们基于剩余的可用帧时间调整分配给垃圾回收的时间，如果启用了 [Vsync](https://docs.unity3d.com/ScriptReference/QualitySettings-vSyncCount.html) 或者 [Application.targetFrameRate](https://docs.unity3d.com/ScriptReference/Application-targetFrameRate.html)。通过这种方式，我们可以及时地运行垃圾回收，而不是等待，从而“免费”进行垃圾回收。

## 启用逐步垃圾回收 Enabling incremental garbage collection

逐步垃圾回收现在可用于以下平台：

- Mac standalone player
- Windows standalone player
- Linux standalone player
- iOS
- Android
- Windows UWP player
- PS4
- Xbox One
- Nintendo Switch
- Unity Editor

注意逐步垃圾回收现在还不能用于 **WebGL**。逐步垃圾回收需要 .NET 4.x 运行时。

在支持的平台，Unity 在 **Player settings**(用户设置) 窗口里的“Other settings(其他设置)”区域提供了启用逐步垃圾回收的选项。只要选中 **Use incremental GC** 复选框。

![Player Settings to enable incremental garbage collection](https://docs.unity3d.com/uploads/Main/gc_settings.png)
*Player Settings to enable incremental garbage collection*

另外，如果你在你项目的 [Quality](https://docs.unity3d.com/Manual/class-QualitySettings.html) 设置 **VSync Count** 的值为 **Don't Sync** 以外的值或者使用了 [Application.VSync](https://docs.unity3d.com/ScriptReference/QualitySettings-vSyncCount.html) 属性或者你设置了 [Application.targetFrameRate](https://docs.unity3d.com/ScriptReference/Application-targetFrameRate.html) 属性，Unity 会自动使用任何给定帧的剩余空闲时间来逐步垃圾回收。

你可以使用 [Scripting.GarbageCollector](https://docs.unity3d.com/ScriptReference/Scripting.GarbageCollector.html) 类来探索更精确的足部垃圾回收控制。举个例子，如果你不想用 VSync 或者目标帧率，你可以自己计算在帧结束之前的可用时间并提供给垃圾回收使用。

## 逐步垃圾回收可能导致的问题 Possible problems with incremental collection

在大多数情况，逐步垃圾回收可以减缓垃圾回收卡顿的问题。但是，在某些情况下，逐步垃圾回收可能在实际情况下没有效果。

当逐步垃圾回收中断工作时，它中断了用来扫描所有对象来决定哪些对象是没有用的匹配阶段。当大多数对象的引用在工作间隙间没有变化时。当一个对象引用改变了，这一些对象必须在下一次被重新扫描。因此，太多的改变会压垮逐步垃圾回收并导致扫描工作永远不能完成，因为它总是有更多的工作要做——在这种情况，垃圾回收会退化到一次完整的，非逐步的回收。
同样的，当使用逐步垃圾回收，Unity 需要生成额外的代码（）来让垃圾回收器知道任何时候一个引用有没有改变（好知道要不要重新扫描它）。这些增加的代码的开销在更改引用时会对性能产生不可忽略的影响。

仍然，大多数经典的 Unity 项目（如果真的有“经典” Unity 项目的话）可以从逐步垃圾回收中受益，特别是受困于垃圾回收卡顿的那些。

注意常常使用 [Profiler(分析器)](https://docs.unity3d.com/Manual/Profiler.html) 来确认你的游戏或者程序像你期待一样表现。

# 更进一步 Further Information

内存管理是一个微妙而复杂的课题，许多学术研究都致力于此。如果你对于学习更多有兴趣，[memorymanagement.org](http://www.memorymanagement.org/) 有着优秀的资源，列举了很多出版物和在线文章。关于对象池的更远一步的信息可以在 [维基页面](http://en.wikipedia.org/wiki/Object_pool_pattern) 或者 [Sourcemaking.com](http://sourcemaking.com/design_patterns/object_pool) 上找到。