// quick-tag.ts
import { TravelNoteStatus, TravelNoteStatusType } from '@/types';

export type Line = number;
export type Lines = number;

// ================= 基础常量定义 =================
export const TotalLines = 31;

export const NoLines: Lines = 0b0000000;
export const NoLine: Line = 0b0000000;

// 核心状态位
export const ApprovedLine: Line = 0b1000000;
export const PendingLine: Line = 0b0100000;
export const RejectedLine: Line = 0b0010000;
export const DeletedLine: Line = 0b0001000;

// 附加状态位
export const VideoLine: Line = 0b0000100;

// ================= 核心操作方法 =================
export function mergeLines(line1: Lines, line2: Lines): Lines {
  return line1 | line2;
}

export function removeLine(line: Lines, lineToRemove: Line): Lines {
  return line & ~lineToRemove;
}

export function includeSomeLine(a: Line | Lines, b: Line | Lines): boolean {
  return (a & b) !== NoLines;
}

// ================= 业务逻辑封装 =================

// 获取游记主要状态（优先判断删除状态）
export function getTravelNoteStatus(quickTag: Lines): TravelNoteStatusType {
  if (includeSomeLine(quickTag, DeletedLine)) return TravelNoteStatus.DELETED;
  if (includeSomeLine(quickTag, ApprovedLine)) return TravelNoteStatus.APPROVED;
  if (includeSomeLine(quickTag, PendingLine)) return TravelNoteStatus.PENDING;
  if (includeSomeLine(quickTag, RejectedLine)) return TravelNoteStatus.REJECTED;
  return TravelNoteStatus.NONE;
}

/**
 * 设置审核状态（互斥操作）
 * @param newStatus 要设置的新状态
 * @param currentTag 当前状态值
 */
export function setTravelNoteStatus(
    newStatus: Exclude<TravelNoteStatusType, 'deleted' | 'none'>,
    currentTag: Lines
): Lines {
  // 清除所有审核状态位
  const clearedTag = removeLine(
      currentTag,
      ApprovedLine | PendingLine | RejectedLine
  );

  // 添加新状态位
  switch (newStatus) {
    case TravelNoteStatus.APPROVED:
      return mergeLines(clearedTag, ApprovedLine);
    case TravelNoteStatus.PENDING:
      return mergeLines(clearedTag, PendingLine);
    case TravelNoteStatus.REJECTED:
      return mergeLines(clearedTag, RejectedLine);
    default:
      return clearedTag;
  }
}

// 添加附加状态（非互斥）
export function addAdditionalTag(tag: Lines, additionalLine: Line): Lines {
  return mergeLines(tag, additionalLine);
}

// 移除附加状态
export function removeAdditionalTag(tag: Lines, additionalLine: Line): Lines {
  return removeLine(tag, additionalLine);
}

// 检查是否包含附加状态
export function hasAdditionalTag(tag: Lines, additionalLine: Line): boolean {
  return includeSomeLine(tag, additionalLine);
}

// 标记为删除状态
export function markAsDeleted(currentTag: Lines): Lines {
  // 清除所有审核状态
  // const cleared = removeLine(
  //     currentTag,
  //     ApprovedLine | PendingLine | RejectedLine
  // );
  // 添加删除状态位
  return mergeLines(currentTag, DeletedLine);
}

// ================= 状态校验方法 =================
// 是否应该展示游记（未删除且至少有一个有效状态）
export function shouldDisplay(tag: Lines): boolean {
  return !includeSomeLine(tag, DeletedLine) && tag !== NoLines;
}

// 是否是有效审核状态（排除删除和未定义状态）
export function isValidAuditStatus(tag: Lines): boolean {
  return [
    ApprovedLine,
    PendingLine,
    RejectedLine
  ].some(line => includeSomeLine(tag, line));
}