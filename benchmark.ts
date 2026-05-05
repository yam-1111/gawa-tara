const tasks = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  dueDate: new Date(2023, 9, Math.floor(Math.random() * 28) + 1).toISOString(),
  recurrence: ["NONE", "DAILY", "WEEKLY", "MONTHLY"][Math.floor(Math.random() * 4)]
}));

const currentDate = new Date(2023, 10, 15);
const daysInMonth = 30;

function originalLogic() {
  const getDailyEvents = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    targetDate.setHours(0, 0, 0, 0)

    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      taskDate.setHours(0, 0, 0, 0)

      if (targetDate < taskDate) return false

      if (task.recurrence === "NONE") {
        return targetDate.getTime() === taskDate.getTime()
      }

      if (task.recurrence === "DAILY") {
        return true
      }

      if (task.recurrence === "WEEKLY") {
        return targetDate.getDay() === taskDate.getDay()
      }

      if (task.recurrence === "MONTHLY") {
        return targetDate.getDate() === taskDate.getDate()
      }

      return false
    })
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const result = days.map(day => getDailyEvents(day))
  return result;
}

function optimizedLogic() {
  const map = new Map<number, any[]>()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const daysMeta = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = new Date(currentYear, currentMonth, day)
    date.setHours(0, 0, 0, 0)
    return {
      day,
      time: date.getTime(),
      dayOfWeek: date.getDay()
    }
  })

  for (let day = 1; day <= daysInMonth; day++) {
    map.set(day, [])
  }

  tasks.forEach(task => {
    if (!task.dueDate) return
    const taskDate = new Date(task.dueDate)
    taskDate.setHours(0, 0, 0, 0)

    const taskTime = taskDate.getTime()
    const taskDayOfMonth = taskDate.getDate()
    const taskDayOfWeek = taskDate.getDay()

    if (task.recurrence === "NONE") {
      if (taskDate.getFullYear() === currentYear && taskDate.getMonth() === currentMonth) {
        map.get(taskDayOfMonth)?.push(task)
      }
    } else if (task.recurrence === "DAILY") {
      for (let i = 0; i < daysInMonth; i++) {
        const meta = daysMeta[i]
        if (meta.time >= taskTime) {
          map.get(meta.day)?.push(task)
        }
      }
    } else if (task.recurrence === "WEEKLY") {
      for (let i = 0; i < daysInMonth; i++) {
        const meta = daysMeta[i]
        if (meta.time >= taskTime && meta.dayOfWeek === taskDayOfWeek) {
          map.get(meta.day)?.push(task)
        }
      }
    } else if (task.recurrence === "MONTHLY") {
      if (taskDayOfMonth <= daysInMonth) {
        const meta = daysMeta[taskDayOfMonth - 1]
        if (meta.time >= taskTime) {
          map.get(meta.day)?.push(task)
        }
      }
    }
  })

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  return days.map(day => map.get(day) || []);
}

console.log("Warming up...");
for (let i = 0; i < 100; i++) {
  originalLogic();
  optimizedLogic();
}

console.log("Benchmarking Original...");
let start = performance.now();
for (let i = 0; i < 100; i++) {
  originalLogic();
}
let originalTime = performance.now() - start;

console.log("Benchmarking Optimized...");
start = performance.now();
for (let i = 0; i < 100; i++) {
  optimizedLogic();
}
let optimizedTime = performance.now() - start;

console.log(`Original Time (100 iterations): ${originalTime.toFixed(2)}ms`);
console.log(`Optimized Time (100 iterations): ${optimizedTime.toFixed(2)}ms`);
console.log(`Improvement: ${(originalTime / optimizedTime).toFixed(2)}x faster`);

// Verify correctness
const o = originalLogic();
const opt = optimizedLogic();

let isCorrect = true;
for (let i = 0; i < daysInMonth; i++) {
  if (o[i].length !== opt[i].length) {
    console.error(`Mismatch at day ${i + 1}: original ${o[i].length}, optimized ${opt[i].length}`);
    isCorrect = false;
  } else {
    // Check elements
    const oIds = o[i].map((t: any) => t.id).sort();
    const optIds = opt[i].map((t: any) => t.id).sort();
    for (let j = 0; j < oIds.length; j++) {
      if (oIds[j] !== optIds[j]) {
         console.error(`Mismatch at day ${i + 1}: original ${oIds[j]}, optimized ${optIds[j]}`);
         isCorrect = false;
         break;
      }
    }
  }
}

if (isCorrect) console.log("✅ Results match!");
