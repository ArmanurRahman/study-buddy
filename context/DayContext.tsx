import React, { createContext, useEffect, useState } from 'react';
import { useRealm } from '@realm/react';

export const DayContext = createContext({ currentDay: '', refreshDay: () => {} });

export const DayProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [currentDay, setCurrentDay] = useState(new Date().toDateString());
  const realm = useRealm();

  // Run this effect only once to set up the interval
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toDateString();
      setCurrentDay((prev) => {
        if (prev !== today) {
          return today;
        }
        return prev;
      });
    }, 60 * 1000); // check every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const plans = realm.objects('Plan');
    plans.forEach((plan: any) => {
      // Parse frequency (boolean array: [Mon, Tue, Wed, Thu, Fri, Sat, Sun])
      let frequency: boolean[] = [];
      try {
        frequency = Array.isArray(plan.frequency)
          ? plan.frequency
          : JSON.parse(plan.frequency || '[]');
      } catch {
        frequency = [];
      }

      // Get today's day index (0=Monday, 6=Sunday)
      const today = new Date(currentDay);
      let todayIdx = today.getDay();
      todayIdx = todayIdx === 0 ? 6 : todayIdx - 1;

      // If today is not in the plan's frequency, skip streak update for this plan
      if (frequency.length > 0 && !frequency[todayIdx]) {
        return;
      }

      // Find the last scheduled day before today
      let lastScheduledDate: Date | null = null;
      for (let i = 1; i <= 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        let checkIdx = checkDate.getDay();
        checkIdx = checkIdx === 0 ? 6 : checkIdx - 1;
        if (frequency[checkIdx]) {
          lastScheduledDate = new Date(checkDate.setHours(0, 0, 0, 0));
          break;
        }
      }

      // If there is no previous scheduled day, skip streak logic
      if (!lastScheduledDate) return;

      // Check if the plan was completed on the last scheduled day
      const lastStatus = realm
        .objects('PlanStatus')
        .filtered(
          'planId == $0 && status == "completed" && date >= $1 && date <= $2',
          plan._id,
          lastScheduledDate,
          new Date(
            lastScheduledDate.getFullYear(),
            lastScheduledDate.getMonth(),
            lastScheduledDate.getDate(),
            23,
            59,
            59,
            999
          )
        )[0];
      if (!lastStatus) {
        // If missed last scheduled day, reset streak
        // But do NOT reset if already updated today (using plan.lastStreakUpdate)
        if (plan.streak !== 0 && plan.lastStreakUpdate !== currentDay) {
          realm.write(() => {
            plan.streak = 0;
            plan.lastStreakUpdate = currentDay;
          });
        }
      }
    });
  }, [currentDay, realm]);
  const refreshDay = () => setCurrentDay(new Date().toDateString());
  return <DayContext.Provider value={{ currentDay, refreshDay }}>{children}</DayContext.Provider>;
};
