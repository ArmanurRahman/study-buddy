import React, { createContext, useEffect, useState } from 'react';
import { useRealm } from '@realm/react';

export const DayContext = createContext({ currentDay: '', refreshDay: () => {} });

export const DayProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [currentDay, setCurrentDay] = useState(new Date().toDateString());
  const realm = useRealm();

  // Run this effect only once to set up the interval
  useEffect(() => {
    console.log('Checking for day change...');
    const interval = setInterval(() => {
      const today = new Date().toDateString();
      setCurrentDay((prev) => {
        if (prev !== today) {
          console.log('Day changed:', today);
          return today;
        }
        return prev;
      });
    }, 60 * 1000); // check every minute

    return () => clearInterval(interval);
  }, []);
  // Update streaks when the day changes, also checking frequency
  useEffect(() => {
    const plans = realm.objects('Plan');
    plans.forEach((plan: any) => {
      // Parse frequency (assume it's stored as JSON string or array)
      let frequency: number[] = [];
      try {
        frequency = Array.isArray(plan.frequency)
          ? plan.frequency
          : JSON.parse(plan.frequency || '[]');
      } catch {
        frequency = [];
      }

      // Get today's day index (0=Monday, 6=Sunday)
      const today = new Date(currentDay);
      let todayIdx = today.getDay(); // JS: 0=Sunday, 1=Monday, ..., 6=Saturday
      todayIdx = todayIdx === 0 ? 6 : todayIdx - 1; // Now: 0=Monday, ..., 6=Sunday

      // If today is not in the plan's frequency, skip streak update for this plan
      if (frequency.length > 0 && !frequency.includes(todayIdx)) {
        return;
      }

      // Find the latest PlanStatus for this plan
      const statuses = realm
        .objects('PlanStatus')
        .filtered('planId == $0', plan._id)
        .sorted('date', true);
      const latestStatus = statuses[0] as any;

      if (latestStatus) {
        const latestDate = new Date(latestStatus.date);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const isYesterday =
          latestDate.getFullYear() === yesterday.getFullYear() &&
          latestDate.getMonth() === yesterday.getMonth() &&
          latestDate.getDate() === yesterday.getDate();

        if (isYesterday && latestStatus.status === 'completed') {
          if (plan.lastStreakUpdate !== currentDay) {
            realm.write(() => {
              plan.streak = (plan.streak || 0) + 1;
              plan.lastStreakUpdate = currentDay;
            });
          }
        } else if (!latestStatus || latestStatus.status !== 'completed' || !isYesterday) {
          if (plan.streak !== 0) {
            realm.write(() => {
              plan.streak = 0;
              plan.lastStreakUpdate = currentDay;
            });
          }
        }
      } else {
        if (plan.streak !== 0) {
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
