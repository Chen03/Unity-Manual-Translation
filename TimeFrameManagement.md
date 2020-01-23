# 时间和帧数控制 Time and Framerate Management

[Update(更新)](https://docs.unity3d.com/ScriptReference/MonoBehaviour.Update.html) 方法允许你直接在脚本中监视输入和其他事件并对此做出恰当的动作。举个梨子，你可以在“前进”键按下时移动角色。在处理这一些基于时间的动作时要记住的一个重要的事是游戏的帧率不恒定，Update 方法调用的时间也不恒定。

举一个它的例子，考虑平稳地把一个对象向前移动，每帧一次。看起来你只要每帧都把对象移动固定距离就够了：

```cs
//C# script example
using UnityEngine;
using System.Collections;

public class ExampleScript : MonoBehaviour {
    public float distancePerFrame;
    
    void Update() {
        transform.Translate(0, 0, distancePerFrame);
    }
}


//JS script example
var distancePerFrame: float;

function Update() {
    transform.Translate(0, 0, distancePerFrame);
}
```

然而，考虑到每帧的时间不是固定的，对象会表现得速度不是固定的。如果帧时间是10毫秒那么这个对象会每一秒向前移动 *distancePerFrame*(每帧距离) 100次。但如果帧时间增加到25毫秒（取决于CPU）那么它只会向前40次，因此行走的距离更短。解决方案是按帧时间决定移动距离，你可以从 [Time.deltaTime](https://docs.unity3d.com/ScriptReference/Time-deltaTime.html) 属性获取帧时间：

```cs
//C# 脚本示范
using UnityEngine;
using System.Collections;

public class ExampleScript : MonoBehaviour {
    public float distancePerSecond;
    
    void Update() {
        transform.Translate(0, 0, distancePerSecond * Time.deltaTime);
    }
}
```

```js
//JS 脚本示范
var distancePerSecond: float;

function Update() {
    transform.Translate(0, 0, distancePerSecond * Time.deltaTime);
}
```

注意移动距离现在以 distancePerSecond(每秒距离) 给出，而不是 distancePerFrame。当帧率改变，移动距离大小会随之改变，因此对象速度是固定的。

## 固定时间步长 Fixed Timestep

不像主要的帧更新，Unity 的物理系统*是*以 **fixed timestep**(固定时间步长) 工作的，这对于模拟的准确性和一致性很重要。在物理更新开始时，Unity 将会在上一次物理更新结束时设置固定时间步长的“闹钟”。物理系统会执行计算直到闹钟响起。

你可以在 [Time(时间)](https://docs.unity3d.com/Manual/class-TimeManager.html) 窗口改变固定时间步长的长短，并且也在脚本中通过 [Time.fixedDeltaTime](https://docs.unity3d.com/ScriptReference/Time-fixedDeltaTime.html) 属性得到。注意更低的时间步长反映在更频繁的物理更新和更精确的模拟上，但这会导致更高的 CPU 负载。你一般不用改默认的时间步长除非你对物理引擎有更高的要求。

## 最大允许时间步长

固定的时间步长使物理模拟相对于现实时间保持精确，但它如果太小，会在游戏的物理需求过大和游戏帧率变低的时候造成问题（比如有很多对象要渲染的时候）。主要帧更新必须“挤”在固定的物理更新中间，而且如果有很多东西要渲染，几个物理更新可以在一帧之中更新发生。由于图形方面的帧时间、对象的位置和其他属性在帧的开始被冻结，图形可能与更频繁更新的物理不同步。

自然你只有那么多 CPU 资源，但 Unity 可以让你选择有效降低物理时间来让帧处理跟上。**Maximum Allowed Timestep**(最大允许时间步长) 设置（在 [Time](https://docs.unity3d.com/Manual/class-TimeManager.html) 窗口中）给 Unity 用来处理物理的时间和FixedUpdate在一帧之间的调用做出了限制。如果一帧的更新用了超过 **Maximum Allowed Timestep** 来处理，物理引擎会“暂停时间”来让帧处理跟上。当帧更新完成，物理时间会恢复，且从上次暂停开始没有时间流动。结果是 **rigidbodies**(刚体) 相对现实时间不会像往常一样完美地移动，而是稍微变慢。但是，物理“时钟”会把它们当作正常移动。物理时间的变慢一般是难以察觉的而且对于游戏性能是可以接受的让步。

## 时间缩放 Time Scale

对于特别的效果，比如“时符「The World」”，有时候让时间暂缓来让动画和脚本响应发生在降低的速率会挺有用。更进一步，你可能有时候想要完全暂停时间，像游戏暂停。Unity 有一个 *Time Scale*(时间缩放) 属性可以控制相对于现实时间游戏进行得多块。如果比例被设置到1.0那么游戏时间和现实时间相同。2.0是两倍速度（动作会变快）而0.5速度会减缓到一半。0会让时间完全“停止”。注意时间缩放不会真正减慢程序执行而只是更改了通过方法 [Time.deltaTime](https://docs.unity3d.com/ScriptReference/Time-deltaTime.html) 和 [Time.fixedDeltaTime](https://docs.unity3d.com/ScriptReference/Time-fixedDeltaTime.html) 返回的时间步长。Update 方法会被调用得更加频繁，而每帧的 *deltaTime* 会减少。别的脚本方法不会受时间缩放影响，打个比方，当游戏暂停的时候你可以显示正常交互的 GUI 。

[Time](https://docs.unity3d.com/Manual/class-TimeManager.html) 窗口有可以让你设置全局时间缩放的属性，但是更常见的是在脚本中通过 [Time.timeScale](https://docs.unity3d.com/ScriptReference/Time-timeScale.html) 属性设置。

```cs
//C# script example
using UnityEngine;
using System.Collections;

public class ExampleScript : MonoBehaviour {
    void Pause() {
        Time.timeScale = 0;
    }
    
    void Resume() {
        Time.timeScale = 1;
    }
}
```

```js
//JS script example
function Pause() {
    Time.timeScale = 0;
}

function Resume() {
    Time.timeScale = 1;
}
```

## 录制帧率 Capture Framerate

时间管理一个非常特殊的情况是当你想要录制游戏的时候。因为保存屏幕图像需要相当的时间，如果你尝试在普通的游戏进程中这么做，正常的游戏帧率会大大降低。这会导致视频不能体现正常的游戏表现。

幸运的是，Unity 提供了一个 [Capture Framerate(录制帧率)](https://docs.unity3d.com/ScriptReference/Time-captureFramerate.html) 的属性可以让你解决这个问题。当这个属性的值设置成非零时，游戏的时间会变慢并且帧更新会定期精确进行。每帧的时间间隔等于 1 / Time.captureFramerate，所以如果值设成 5.0 那么更新每秒会发生五次。因为在帧率上的需求显著降低，你会有充足的时间去保存屏幕快照和进行其他行为：

```cs
//C# 脚本范例
using UnityEngine;
using System.Collections;

public class ExampleScript : MonoBehaviour {
    // Capture frames as a screenshot sequence. Images are
    // stored as PNG files in a folder - these can be combined into
    // a movie using image utility software (eg, QuickTime Pro).
    // The folder to contain our screenshots.
    // If the folder exists we will append numbers to create an empty folder.
    string folder = "ScreenshotFolder";
    int frameRate = 25;
        
    void Start () {
        // Set the playback framerate (real time will not relate to game time after this).
        Time.captureFramerate = frameRate;
        
        // Create the folder
        System.IO.Directory.CreateDirectory(folder);
    }
    
    void Update () {
        // Append filename to folder name (format is '0005 shot.png"')
        string name = string.Format("{0}/{1:D04} shot.png", folder, Time.frameCount );
        
        // Capture the screenshot to the specified file.
        Application.CaptureScreenshot(name);
    }
}
```

```js
//JS 脚本范例

// Capture frames as a screenshot sequence. Images are
// stored as PNG files in a folder - these can be combined into
// a movie using image utility software (eg, QuickTime Pro).
// The folder to contain our screenshots.
// If the folder exists we will append numbers to create an empty folder.
var folder = "ScreenshotFolder";
var frameRate = 25;


function Start () {
    // Set the playback framerate (real time will not relate to game time after this).
    Time.captureFramerate = frameRate;

    // Create the folder
    System.IO.Directory.CreateDirectory(folder);
}

function Update () {
    // Append filename to folder name (format is '0005 shot.png"')
    var name = String.Format("{0}/{1:D04} shot.png", folder, Time.frameCount );

    // Capture the screenshot to the specified file.
    Application.CaptureScreenshot(name);
}
```