# 事件方法 Event Functions

Unity 中的脚本不像传统程序所做的那样不停在循环中重复地运行代码知道它完成任务。取而代之，Unity 间歇地把控制权交给脚本，通过调用在脚本中定义的特定方法。当一个方法执行完毕，控制权就会交回 Unity。这些方法被称作事件方法，因为他们被 Unity 所激活，来对游戏过程中发生的事件作出反应。举个核桃，你已经见识过 Update(更新) 方法（在每帧更新发生时调用）和 Start(开始) 方法（在对象第一次帧更新时调用）了。Unity 中还有许多其他的可用方法；完整的列表在 [MonoBehaviour](https://docs.unity3d.com/ScriptReference/MonoBehaviour.html) 类脚本参考页面，包含它们的详细用法。下面是一些最常用和重要的事件。

## 直接更新事件 Regular Update Events

游戏十分像每帧都在动态生成的动画。游戏的一个关键内容是在每帧被渲染之前对象的位置，状态及表现做出改变。Update 方法是这类代码在 Unity 中的主要舞台（有点怪？理解理解）。Update 在每帧渲染前和动画计算前被调用。

```cs
void Update() {
    float distance = speed * Time.deltaTime * Input.GetAxis("Horizontal");
    transform.Translate(Vector3.right * distance);
}
```

**Physics engine**(物理引擎) 在不与帧 **rendering**(渲染) 相关的时间步长中以类似的方式进行更新。一个单独的事件方法 [FixedUpdate(固定更新)](https://docs.unity3d.com/ScriptReference/MonoBehaviour.FixedUpdate.html) 会在每次物理更新前被调用。因为物理更新和帧更新发生频率不同，比起 Update 方法，物理代码在 FixedUpdate 方法会得到更加准确的结果。

```cs
void FixedUpdate() {
    Vector3 force = transform.forward * driveForce * Input.GetAxis("Vertical");
    __rigidbody__.AddForce(force);
}
```

有时在 scene(场景) 中所有的对象的 FixedUpdate 方法被调用和所有动画被计算之后的某个时刻做更多的改动很有用。举个花生，camera(相机) 要保持聚焦在目标对象上；相机方向的改动必须在目标对象移动后做出。另一个瓜子是脚本代码应该覆盖动画的效果(例如，让角色的头朝向场景中的目标对象)。[LateUpdate(延迟更新)](https://docs.unity3d.com/ScriptReference/MonoBehaviour.LateUpdate.html) 方法可以用于这些情景。

```cs
void LateUpdate() {
    Camera.main.transform.LookAt(target.transform);
}
```

## 初始化事件 Initialization Events

能够在任何游戏更新发生前调用初始化代码常常很有用。[Start(开始)](https://docs.unity3d.com/ScriptReference/MonoBehaviour.Start.html) 方法在对象第一次帧更新或者物理更新之前被调用。在场景加载时，场景中每一个对象的 [Awake(唤醒)](https://docs.unity3d.com/ScriptReference/MonoBehaviour.Awake.html) 方法会被调用。注意虽然这么多的对象的 Start 和 Awake 方法调用的顺序没有特定的顺序，但所有的 Awake 方法都会在第一个 Start 调用前完成。这意味着 Start 方法中的代码可以利用之前在 Awake 阶段中执行了的初始化的内容。

## GUI 事件 GUI events

Unity 有一个系统可以在场景的主要动作上渲染 GUI 控件并对点击控制做出响应。处理这些代码比起普通的帧更新稍有不同，所以它们应该放置在 [OnGUI](https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnGUI.html) 方法中，它会被定期调用。

```cs
void OnGUI() {
    GUI.Label(labelRect, "Game Over");
}
```

您还可以检测发生在 GameObject(游戏物体) 上的鼠标事件，当它出现在场景中。这可以用来标志武器或者显示关于在鼠标指针下面的角色的信息。一组 OnMouseXXX 事件方法（例如 [OnMouseOver](https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnMouseOver.html) [OnMouseDown](https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnMouseDown.html)）可以让脚本去响应用户的鼠标动作。又一个坚果，如果鼠标在一个特定对象上点击，那么如果对象的 OnMouseDown 方法就会被调用（如果有的话）。

## 物理事件 Physics events

物理引擎会报告发生在一个对象上的撞击，通过调用那个对象的脚本。[OnCollisionEnter](https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnCollisionEnter.html), [OnCollisionStay](https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnCollisionStay.html) 和 [OnCollisionExit](https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnCollisionExit.html) 方法会被调用，当联系被创建，保持和破坏的时候。当对象的 **collider**(碰撞体) 被配置成 Trigger(触发器) 的时候，对应的方法就会被调用（就是 collider 只是检测有什么进入他了，而不会做出物理响应）。这些方法可能在一次物理更新中被调用多次，如果有多于一次接触被检测到。因此调用的时候会传递一个包含碰撞细节的参数（像位置，要碰你的对象的身份什么的）。

```cs
void OnCollisionEnter(otherObj: Collision) {
    if (otherObj.tag == "Arrow") {
        ApplyDamage(10);
    }
}
```