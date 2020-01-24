# 创建并使用脚本 Creating and Using Scripts

**GameObjects**(游戏对象) 的行为由依附于它的 **Components**(组件) 所控制。尽管 Unity 的内建组件用途多样，你还是很快就会发现你要深入他们所提供的功能的背后才能够实现你的游戏玩法特性。Unity 允许你通过脚本创建你自己的组件。它们允许你触发游戏事件，随着时间修改组件属性并且以你喜欢的方式对用户的输入进行相应。

Unity 原生支持 C# 语言编程。C# (读作C-Sharp，莎普)是一个工业级别的语言，像 Java 和 C++ 一样。

作为对它的附加，许多其他的 .NET 语言可以在 Unity 中使用，只要可以编译出兼容的 DLL 文件-查看 [这里]() 以获取更多细节。

学习编程思想和这些特定语言的使用涵盖在本章节的范围之中，但是还有许多其他书本，教程和资源有如何在 Unity 中的编程知识。参阅 我们网站的 [学习章节]() 以了解进一步的细节。

## 创建脚本 Creating Scripts

不像其他资源，脚本是直接在 Unity 中创建的。你可以在位于 Project (项目)面板的顶部左边Create(创建)菜单创建新的脚本或者在主菜单中选择 Assets > Create > C# Script。

新脚本会在于项目面板中选择的任意文件夹中被创建。新脚本的名字会被选择，提示你改名。

![](https://docs.unity3d.com/uploads/Main/NewScriptIcon.png)

现在就命名比起过会儿会更好。你输入的文件名会被用来创建文件内的起始代码，在下面有栗子。

## 脚本文件解析 Anatomy of a Script file

当双击 Unity 中的一个脚本资源时，它会在编辑器中打开。Unity 默认用 Visual Studio，但你也可以在 Unity 首选项(**在Unity > Preferences**)中的 **External Tools**(外部工具) 面板选别的(VSCode赛高！)。

文件的初始内容长的像这样：

```csharp
using UnityEngine;
using System.Collections;

public class MainPlayer : MonoBehaviour {

    // 用这个初始化
    void Start () {
    
    }
    
    // 每帧调用一次
    void Update () {
    
    }
}
```

脚本通过继承 Unity 的内建类 **MonoBehaviour** 来联系Unity的内部工作。你可以把类比喻成一种创建可以添加到 GameObject 的 Component 类型的一种蓝图。每次你给游戏对象添加一个组件，都会创建一个被这个组件的类所定义的实例。类的名字是你创建文件时所决定的文件名。要把组件添加到游戏对象，文件名和类名必须一致。

然鹅，最需要关注的东西是两个在类中定义的函数。 Update(更新) 函数是放处理每帧游戏对象的更新的代码的。这可能包括移动，触发动作和响应用户输入，基本上是游戏过程中需要处理的任何事情。

为了使 Update 函数能够完成它的工作，在任何游戏动作发生之前能够设置变量、读取首选项并与其他游戏对象建立连接通常是很有用的。 Start 函数将在游戏开始之前被 Unity 调用(即在 Update 函数第一次被调用之前)，并且是进行任何初始化的理想场所。

有经验的程序员请注意：你可能会惊讶于对象的初始化不是在构造函数中完成的。这是因为对象的构造函数是被编辑器处理的，并且不会如你预想的那样发生在游戏开始的时候。如果你试图为脚本组件定义一个构造函数，他会干扰 Unity 的普通操作并在项目中造成问题。

## 控制一个游戏对象 Controlling a GameObject

像上面写的一样，脚本只定义一个组件的蓝图。它的代码不会运行，直到它的一个实例被添加到了一个游戏对象。你可以添加一个脚本(组件)通过拖拽脚本到层级面板中的一个游戏对象上，或者一个被选择的游戏对象的 Inspector(检查器) 上。在 Component 菜单中的 Script(脚本) 子菜单中也包含了所有在项目中可用的脚本，包括你自己创建的。脚本实例跟 Inspector 中别的 Component 长得几乎一样：

![](https://docs.unity3d.com/uploads/Main/ScriptInInspector.png)

当添加到游戏对象之后，脚本会在你按下 Play(开始) 并运行游戏的时候开始工作。你可以添加下面的代码来验证：

```csharp
// Use this for initialization
void Start () 
{
    Debug.Log("I am alive!");
}
```

**Debug.Log** 是一个把信息打到 Unity 的命令行输出上的一个简单命令。如果你现在按开始按钮，你会在主 Untiy 编辑器窗口和 Console(命令行) 窗口中看见信息(菜单：**Window > General > Console**)。