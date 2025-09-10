import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PioneerTimerService } from '../../services/pioneer-timer.service';
import { ServiceEntry, Settings, MonthlyData } from '../../models';
import { StatsOverviewComponent } from './overview/stats-overview.component';
import { DailyRequirementsComponent, DailyRequirements } from './overview/daily-requirements.component';
import { MonthlyChartComponent, MonthlyChartData } from './charts/monthly-chart.component';

// Import new services
import { StatisticsNavigationService, NavigationState, StatisticsTargets } from './services/statistics-navigation.service';
import { StatisticsCalculationService } from './services/statistics-calculation.service';
import { StatisticsTextService } from './services/statistics-text.service';
import { StatisticsChartService } from './services/statistics-chart.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    StatsOverviewComponent,
    DailyRequirementsComponent,
    MonthlyChartComponent
  ],
  template: `
    <h2>Statystyki</h2>
    
    <div class="current-service-year">
      <h3>Rok służbowy {{ serviceYear }}/{{ serviceYear + 1 }}</h3>
      <div class="service-year-info">
        <span>1 września {{ serviceYear }} - 31 sierpnia {{ serviceYear + 1 }}</span>
      </div>
    </div>

    <app-stats-overview
      [currentMonthHours]="currentMonthHours"
      [currentYearCountable]="currentYearCountable"
      [goalProgress]="goalProgress"
      [hoursToGoal]="hoursToGoal"
      [yearBreakdownText]="yearBreakdownText"
      [monthlyBreakdownText]="monthlyBreakdownText"
      [yearlyGoal]="yearlyGoal"
      [monthlyTarget]="monthlyTarget"
      [yearlyTarget]="yearlyTarget"
      [monthlyDifference]="monthlyDifference"
      [yearlyDifference]="yearlyDifference"
      [monthlyExpectedToday]="monthlyExpectedToday"
      [yearlyExpectedToday]="yearlyExpectedToday"
      [selectedMonthYear]="getSelectedMonthYear()"
      [selectedServiceYear]="getSelectedServiceYearText()"
      (navigateMonth)="navigateMonth($event)"
      (navigateYear)="navigateYear($event)">
    </app-stats-overview>

    <app-daily-requirements
      [requirements]="dailyRequirements">
    </app-daily-requirements>

    <app-monthly-chart
      [data]="monthlyData">
    </app-monthly-chart>
  `
})
export class StatisticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Navigation state
  navigationState: NavigationState = {
    selectedMonth: 0,
    selectedYear: 0,
    selectedServiceYear: 0
  };
  
  // Data properties
  serviceYear = 0;
  currentMonthHours: MonthlyData = {
    totalHours: 0,
    serviceHours: 0,
    otherHours: 0,
    overLimitHours: 0,
    countableHours: 0
  };
  currentYearCountable = 0;
  goalProgress = 0;
  hoursToGoal = 0;
  yearlyGoal = 600;
  dailyRequirements: DailyRequirements = {
    monthlyRequirement: 0,
    yearlyRequirement: 0,
    daysRemainingInMonth: 0,
    daysRemainingInYear: 0
  };
  monthlyData: MonthlyChartData[] = [];
  
  // Targets and differences
  statisticsTargets: StatisticsTargets = {
    monthlyTarget: 0,
    yearlyTarget: 0,
    monthlyDifference: 0,
    yearlyDifference: 0,
    monthlyExpectedToday: 0,
    yearlyExpectedToday: 0
  };
  
  // Text data
  yearBreakdownText = '';
  monthlyBreakdownText = '';
  
  Math = Math;

  private entries: ServiceEntry[] = [];
  private settings: Settings | null = null;

  private pioneerService = inject(PioneerTimerService);
  private navigationService = inject(StatisticsNavigationService);
  private calculationService = inject(StatisticsCalculationService);
  private textService = inject(StatisticsTextService);
  private chartService = inject(StatisticsChartService);

  ngOnInit(): void {
    // Subscribe to navigation state changes
    this.navigationService.navigationState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.navigationState = state;
        this.updateStatistics();
      });

    // Subscribe to data changes
    combineLatest([
      this.pioneerService.entries$,
      this.pioneerService.settings$
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([entries, settings]) => {
      this.entries = entries;
      this.settings = settings;
      if (settings) {
        this.yearlyGoal = settings.yearlyGoal;
      }
      this.updateStatistics();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateStatistics(): void {
    if (!this.entries || !this.settings || !this.navigationState) return;

    this.serviceYear = this.navigationState.selectedServiceYear;

    // Selected month hours
    this.currentMonthHours = this.pioneerService.getMonthHours(
      this.navigationState.selectedYear, 
      this.navigationState.selectedMonth, 
      this.entries
    );

    // Selected service year hours
    this.currentYearCountable = this.pioneerService.calculateYearlyCountableHours(
      this.navigationState.selectedServiceYear, 
      this.entries
    );

    // Goal progress
    this.goalProgress = (this.currentYearCountable / this.yearlyGoal) * 100;
    this.hoursToGoal = Math.max(0, this.yearlyGoal - this.currentYearCountable);

    // Daily requirements (based on selected month/year)
    this.dailyRequirements = this.pioneerService.getDailyRequirements(
      this.navigationState.selectedServiceYear, 
      this.currentMonthHours.countableHours, 
      this.currentYearCountable
    );

    // Calculate targets and differences using service
    this.statisticsTargets = this.calculationService.calculateTargetsAndDifferences(
      this.navigationState,
      this.currentMonthHours.countableHours,
      this.currentYearCountable
    );

    // Generate text content using service
    this.yearBreakdownText = this.textService.getYearBreakdownText(
      this.serviceYear, 
      this.entries
    );
    this.monthlyBreakdownText = this.textService.getMonthlyBreakdownText(
      this.navigationState.selectedYear,
      this.navigationState.selectedMonth,
      this.entries
    );

    // Monthly chart data using service
    this.monthlyData = this.chartService.generateMonthlyChartData(
      this.serviceYear, 
      this.entries
    );
  }

  // Navigation methods - delegate to navigation service
  navigateMonth(direction: 'prev' | 'next'): void {
    this.navigationService.navigateMonth(direction);
  }

  navigateYear(direction: 'prev' | 'next'): void {
    this.navigationService.navigateYear(direction);
  }

  // Getter methods for template
  get monthlyTarget(): number {
    return this.statisticsTargets.monthlyTarget;
  }

  get yearlyTarget(): number {
    return this.statisticsTargets.yearlyTarget;
  }

  get monthlyDifference(): number {
    return this.statisticsTargets.monthlyDifference;
  }

  get yearlyDifference(): number {
    return this.statisticsTargets.yearlyDifference;
  }

  get monthlyExpectedToday(): number {
    return this.statisticsTargets.monthlyExpectedToday;
  }

  get yearlyExpectedToday(): number {
    return this.statisticsTargets.yearlyExpectedToday;
  }

  getSelectedMonthYear(): string {
    return this.navigationService.getSelectedMonthYear(
      this.navigationState.selectedMonth,
      this.navigationState.selectedYear
    );
  }

  getSelectedServiceYearText(): string {
    return this.navigationService.getSelectedServiceYearText(
      this.navigationState.selectedServiceYear
    );
  }
}
